from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import mongo
from bson import ObjectId
from datetime import datetime

user_bp = Blueprint("user", __name__)

# 1️⃣ GET DASHBOARD DATA
@user_bp.route("/dashboard-data", methods=["GET"])
@jwt_required()
def dashboard_data():
    email = get_jwt_identity()
    user = mongo.db.users.find_one({"email": email}, {"password": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404

    orders = list(mongo.db.orders.find({"email": email}).sort("created_at", -1))

    user["_id"] = str(user["_id"])
    for order in orders:
        order["_id"] = str(order["_id"])
        if "created_at" in order:
            if isinstance(order["created_at"], datetime):
                order["created_at"] = order["created_at"].isoformat()

    return jsonify({
        "user": user,
        "orders": orders
    }), 200

# 2️⃣ UPDATE PROFILE
@user_bp.route("/update-profile", methods=["PUT"])
@jwt_required()
def update_profile():
    email = get_jwt_identity()
    data = request.get_json()

    update_fields = {
        "name": data.get("name"),
        "contact": {
            "email": email,
            "phone": data.get("phone")
        }
    }

    mongo.db.users.update_one(
        {"email": email},
        {"$set": update_fields}
    )
    return jsonify({"message": "Profile updated successfully"}), 200

# 3️⃣ ADD NEW ADDRESS
@user_bp.route("/add-address", methods=["POST"])
@jwt_required()
def add_address():
    email = get_jwt_identity()
    address_data = request.get_json()
    address_data["id"] = str(ObjectId())

    mongo.db.users.update_one(
        {"email": email},
        {"$push": {"addresses": address_data}}
    )
    return jsonify({"message": "Address added successfully", "address": address_data}), 201

# 4️⃣ DELETE ADDRESS (Keep only ONE version of this)
@user_bp.route("/delete-address/<address_id>", methods=["DELETE"])
@jwt_required()
def delete_address(address_id):
    email = get_jwt_identity()
    
    result = mongo.db.users.update_one(
        {"email": email},
        {"$pull": {"addresses": {"id": address_id}}}
    )

    if result.modified_count > 0:
        return jsonify({"message": "Address deleted successfully"}), 200
    
    return jsonify({"error": "Address ID not found in database"}), 404