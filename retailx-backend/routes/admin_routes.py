from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import bcrypt, mongo
from models.admin_model import Admin
from models.complaint import Complaint # <--- Naya Import
from bson import ObjectId
import os

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

# --- AUTH ROUTES ---
@admin_bp.route("/register", methods=["POST"])
def register_admin():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    admin_key = data.get("adminKey") # Get the secret key from frontend

    # 1. (Optional) Verify Secret Key
    # Replace "YOUR_SECRET_KEY" with your actual secret code
    if admin_key != os.getenv("ADMIN_SECRET_KEY"):
        return jsonify({"message": "Invalid Admin Secret Key"}), 403

    if not email or not password:
        return jsonify({"message": "Email and password required"}), 400

    existing = Admin.find_by_email(email)
    if existing:
        return jsonify({"message": "Admin already exists"}), 400

    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    
    # 2. Add 'role' to the document for consistency
    admin = {
        "email": email, 
        "password": hashed,
        "role": "admin"
    }
    mongo.db.admins.insert_one(admin)

    # 3. FIX: Generate a token so the user is logged in immediately
    token = create_access_token(
        identity=email, 
        additional_claims={"role": "admin"}
    )

    return jsonify({
        "token": token, 
        "message": "Admin registered successfully"
    }), 201

@admin_bp.route("/login", methods=["POST"])
def login_admin():
    data = request.json
    admin = Admin.find_by_email(data.get("email"))
    if not admin or not bcrypt.check_password_hash(admin["password"], data.get("password")):
        return jsonify({"message": "Invalid credentials"}), 401
    
    token = create_access_token(identity=data.get("email"), additional_claims={"role": "admin"})
    return jsonify({"token": token, "message": "Admin login success"}), 200

# --- DATA MANAGEMENT ROUTES ---

@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def get_all_users():
    users = list(mongo.db.users.find({}, {"password": 0}))
    for u in users: u["_id"] = str(u["_id"])
    return jsonify(users), 200

@admin_bp.route("/users/<id>", methods=["DELETE"])
@jwt_required()
def delete_user(id):
    try:
        if not ObjectId.is_valid(id):
            return jsonify({"message": "Invalid User ID format"}), 400
        result = mongo.db.users.delete_one({"_id": ObjectId(id)})
        if result.deleted_count > 0:
            return jsonify({"message": "User deleted"}), 200
        return jsonify({"message": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/sellers", methods=["GET"])
@jwt_required()
def get_all_sellers():
    try:
        sellers = list(mongo.db.sellers.find({}, {"password": 0}))
        for s in sellers: s["_id"] = str(s["_id"])
        return jsonify(sellers), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@admin_bp.route("/sellers/<id>", methods=["DELETE"])
@jwt_required()
def delete_seller(id):
    try:
        result = mongo.db.sellers.delete_one({"_id": ObjectId(id)})
        if result.deleted_count > 0:
            return jsonify({"message": "Seller removed"}), 200
        return jsonify({"message": "Seller not found"}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@admin_bp.route("/orders", methods=["GET"])
@jwt_required()
def get_all_orders():
    orders = list(mongo.db.orders.find().sort("created_at", -1))
    for o in orders: o["_id"] = str(o["_id"])
    return jsonify(orders), 200

# --- NEW: SUPPORT & COMPLAINTS ROUTES ---

@admin_bp.route("/complaints", methods=["GET"])
@jwt_required()
def get_admin_complaints():
    try:
        # Model ka static method use karke saari complaints mangwayi
        complaints = Complaint.get_all()
        return jsonify(complaints), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@admin_bp.route("/complaints/status", methods=["PATCH"])
@jwt_required()
def update_complaint_status():
    try:
        data = request.json
        complaint_id = data.get("id")
        new_status = data.get("status") # E.g., "Resolved" ya "In-Progress"

        if not complaint_id or not new_status:
            return jsonify({"message": "Complaint ID and Status are required"}), 400

        result = Complaint.update_status(complaint_id, new_status)
        if result.modified_count > 0:
            return jsonify({"message": f"Complaint status updated to {new_status}"}), 200
        return jsonify({"message": "Complaint not found or no changes made"}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# --- STATS ROUTE ---
@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_admin_stats():
    try:
        total_users = mongo.db.users.count_documents({})
        total_sellers = mongo.db.sellers.count_documents({})
        total_products = mongo.db.products.count_documents({})
        total_orders = mongo.db.orders.count_documents({})
        total_complaints = mongo.db.complaints.count_documents({"status": "Pending"}) # Naya Stat
        
        pipeline = [{"$group": {"_id": None, "totalRevenue": {"$sum": "$total"}}}]
        revenue_result = list(mongo.db.orders.aggregate(pipeline))
        total_revenue = revenue_result[0]['totalRevenue'] if revenue_result else 0

        return jsonify({
            "users": total_users,
            "sellers": total_sellers,
            "products": total_products,
            "orders": total_orders,
            "pending_complaints": total_complaints, # Dashboard pe dikhane ke liye
            "revenue": round(total_revenue, 2)
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500