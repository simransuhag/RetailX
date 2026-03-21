from flask import Blueprint, jsonify, request
from extensions import mongo
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId

wishlist_bp = Blueprint('wishlist_bp', __name__)

# 1. Toggle Wishlist (Add/Remove)
@wishlist_bp.route("/toggle", methods=["POST"])
@jwt_required()
def toggle_wishlist():
    try:
        user_email = get_jwt_identity()
        data = request.json
        product_id = data.get("productId")

        if not product_id or not ObjectId.is_valid(product_id):
            return jsonify({"error": "Invalid Product ID"}), 400

        # Check karo kya product pehle se wishlist mein hai
        user = mongo.db.users.find_one({"email": user_email})
        wishlist = user.get("wishlist", [])
        
        p_id = ObjectId(product_id)

        if p_id in wishlist:
            # Agar hai toh REMOVE karo ($pull)
            mongo.db.users.update_one(
                {"email": user_email},
                {"$pull": {"wishlist": p_id}}
            )
            return jsonify({"msg": "Removed from wishlist", "status": "removed"}), 200
        else:
            # Agar nahi hai toh ADD karo ($addToSet)
            mongo.db.users.update_one(
                {"email": user_email},
                {"$addToSet": {"wishlist": p_id}}
            )
            return jsonify({"msg": "Added to wishlist", "status": "added"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2. Get User's Wishlist Products
@wishlist_bp.route("/", methods=["GET"])
@jwt_required()
def get_wishlist():
    try:
        user_email = get_jwt_identity()
        user = mongo.db.users.find_one({"email": user_email})
        
        wishlist_ids = user.get("wishlist", [])
        
        # In IDs se products fetch karo
        products = list(mongo.db.products.find({"_id": {"$in": wishlist_ids}}))
        
        # Format products for frontend
        formatted_products = []
        for p in products:
            p["_id"] = str(p["_id"])
            formatted_products.append(p)
            
        return jsonify(formatted_products), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
# ... purana code (toggle aur get functions) ...

# 3. Clear Entire Wishlist (YAHAN PASTE KAREIN)
@wishlist_bp.route("/clear", methods=["DELETE"])
@jwt_required()
def clear_wishlist():
    try:
        user_email = get_jwt_identity()

        # Update query: wishlist array ko empty list set kar do
        result = mongo.db.users.update_one(
            {"email": user_email},
            {"$set": {"wishlist": []}}
        )

        if result.modified_count >= 0:
            return jsonify({"msg": "Wishlist cleared successfully"}), 200
        else:
            return jsonify({"error": "User not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500