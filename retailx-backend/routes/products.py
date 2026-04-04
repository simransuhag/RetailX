from flask import Blueprint, jsonify, request
from bson import ObjectId
from extensions import mongo
import re
from datetime import datetime

product_bp = Blueprint('product_bp', __name__)

# ✅ HELPER: Ye function deals check karega (Same logic as public_ops.py)
def get_deal_for_product(product):
    today_str = datetime.utcnow().strftime('%Y-%m-%d')
    
    # Deals collection mein check karo ki is product ki category par koi active deal hai?
    active_deal = mongo.db.deals.find_one({
        "category": {"$regex": f"^{product.get('category')}$", "$options": "i"},
        "status": "Active",
        "expiry": {"$gte": today_str}
    })

    mrp = float(product.get('price', 0))
    
    if active_deal:
        # Agar deal milti hai, toh admin wala discount apply karo
        admin_discount = float(active_deal.get('discount', 0))
        final_price = mrp * (1 - (admin_discount / 100))
        
        return {
            "hasDeal": True,
            "discount": int(admin_discount),
            "finalPrice": round(final_price, 2)
        }
    else:
        # Agar koi active deal nahi hai
        p_discount = float(product.get('discount', 0))
        final_price = mrp * (1 - (p_discount / 100)) if p_discount > 0 else mrp
        return {
            "hasDeal": False,
            "discount": int(p_discount),
            "finalPrice": round(final_price, 2)
        }

# ✅ Get Single Product
@product_bp.route("/<id>", methods=["GET"])
def get_single_product(id):
    try:
        product = mongo.db.products.find_one({"_id": ObjectId(id)})
        if product:
            # Deal logic fetch karke apply karo
            deal_info = get_deal_for_product(product)
            
            product['_id'] = str(product['_id'])
            product['finalPrice'] = deal_info['finalPrice']
            product['discount'] = deal_info['discount']
            product['hasDeal'] = deal_info['hasDeal'] # Ye frontend ko batayega deal dikhani hai
            
            return jsonify(product), 200
        return jsonify({"error": "Product not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ✅ MAIN ROUTE: Get Products (category / limit)
@product_bp.route('/', methods=['GET'])
def get_products():
    category_name = request.args.get('category', '').strip()
    limit = int(request.args.get('limit', 8))
    
    query = {}
    if category_name and category_name.lower() != "general":
        query["category"] = {"$regex": f".*{category_name}.*", "$options": "i"}

    try:
        products_cursor = mongo.db.products.find(query).limit(limit)
        formatted_products = []
        
        for p in list(products_cursor):
            deal_info = get_deal_for_product(p)
            formatted_products.append({
                "_id": str(p.get("_id")),
                "name": p.get("name", "No Name"),
                "price": p.get("price", 0),
                "finalPrice": deal_info['finalPrice'],
                "discount": deal_info['discount'],
                "hasDeal": deal_info['hasDeal'],
                "imageURL": p.get("imageURL") or p.get("image") or "",
                "category": p.get("category", ""),
                "brand": p.get("brand", "")
            })
            
        return jsonify(formatted_products), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ... (baaki routes latest/debug same rahenge)






# ✅ Get Random/Latest Products
@product_bp.route("/latest", methods=["GET"])
def get_latest_products():
    try:
        pipeline = [
            {"$sample": {"size": 8}} # Pick 8 random ones
        ]
        products = list(mongo.db.products.aggregate(pipeline))
        for p in products:
            p['_id'] = str(p['_id'])
        return jsonify(products), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Add this to routes/products.py
@product_bp.route('/debug/categories', methods=['GET'])
def list_categories():
    try:
        # This gets every unique category name currently in your products collection
        categories = mongo.db.products.distinct("category")
        return jsonify({
            "found_categories": categories,
            "count": len(categories)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500