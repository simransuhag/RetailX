from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import mongo
from datetime import datetime
from bson import ObjectId

# Blueprint definition
admin_ops_bp = Blueprint("admin_ops", __name__)

# ✅ GET: Fetch only ACTIVE (non-expired) deals
@admin_ops_bp.route("/deals", methods=["GET"])
@jwt_required()
def get_deals():
    try:
        # Aaj ki date string format mein (YYYY-MM-DD)
        today_str = datetime.utcnow().strftime('%Y-%m-%d')

        # Filter: Expiry date aaj ya future ki honi chahiye
        query = {
            "expiry": {"$gte": today_str}
        }

        # Fetch deals and sort by latest
        deals = list(mongo.db.deals.find(query).sort("created_at", -1))
        
        for d in deals:
            d['_id'] = str(d['_id'])
            # Default category agar miss ho jaye
            d['category'] = d.get('category', 'general')
            
        return jsonify(deals), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# ✅ POST: Add a new deal (Auto-expires old ones in same category)
@admin_ops_bp.route("/deals", methods=["POST"])
@jwt_required()
def add_deal():
    try:
        data = request.json
        email = get_jwt_identity() 
        
        # Category formatting (Lowercase for consistency)
        category = data.get('category', 'general').lower().strip()

        # Validation
        if not data.get('title') or not data.get('discount'):
            return jsonify({"message": "Title and Discount are required"}), 400

        # 🚀 STEP 1: Purani saari deals ko "Expired" mark karo (Category specific)
        # Isse database clean rehta hai aur frontend pe confusion nahi hota
        mongo.db.deals.update_many(
            {"category": category, "status": "Active"},
            {"$set": {"status": "Expired"}}
        )

        # 🚀 STEP 2: Nayi deal insert karo
        new_deal = {
            "title": data.get('title'),
            "discount": str(data.get('discount')), # String ya float, dono frontend pe handle ho jayenge
            "expiry": data.get('expiry'), 
            "category": category,
            "status": "Active", 
            "created_by": email,
            "created_at": datetime.utcnow()
        }

        mongo.db.deals.insert_one(new_deal)
        
        return jsonify({"message": f"Deal Published for {category}!"}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# ✅ DELETE: Manually remove a deal
@admin_ops_bp.route("/deals/<id>", methods=["DELETE"])
@jwt_required()
def delete_deal(id):
    try:
        if not ObjectId.is_valid(id):
            return jsonify({"message": "Invalid ID format"}), 400

        result = mongo.db.deals.delete_one({"_id": ObjectId(id)})
        
        if result.deleted_count > 0:
            return jsonify({"message": "Deal removed successfully"}), 200
        
        return jsonify({"message": "Deal not found"}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
# admin_ops.py ke end mein add karo
@admin_ops_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    try:
        # Counts nikalne ke liye
        users_count = mongo.db.users.count_documents({})
        sellers_count = mongo.db.sellers.count_documents({})
        products_count = mongo.db.products.count_documents({})
        orders_count = mongo.db.orders.count_documents({})
        
        # Revenue calculation (total fields ka sum)
        pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total"}}}]
        revenue_data = list(mongo.db.orders.aggregate(pipeline))
        total_revenue = revenue_data[0]['total'] if revenue_data else 0

        return jsonify({
            "users": users_count,
            "sellers": sellers_count,
            "products": products_count,
            "orders": orders_count,
            "revenue": total_revenue
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# routes/admin_ops.py mein add karo

@admin_ops_bp.route("/categories", methods=["GET"])
@jwt_required()
def get_unique_categories():
    try:
        # distinct() method se humein saari unique categories ki list mil jayegi
        categories = mongo.db.products.distinct("category")
        # Filter out None values if any
        categories = [cat for cat in categories if cat]
        return jsonify(categories), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500