from flask import Blueprint, jsonify, request
from extensions import mongo
from repositories.products_repository import format_product
from repositories.semantic_search import semantic_search
from datetime import datetime

search_bp = Blueprint('search_bp', __name__)

@search_bp.route("/search", methods=["GET"])
def search_products():
    query = request.args.get('q', '').strip()
    category_filter = request.args.get('category', '').strip()

    if not query and not category_filter:
        return jsonify([]), 200

    try:
        # --- 1. DATA FETCHING (Semantic or Category-only) ---
        if not query and category_filter:
            # Sirf category click hone par pure MongoDB se fetch karo
            raw_products = list(mongo.db.products.find({
                "category": {"$regex": category_filter, "$options": "i"},
                "isActive": True
            }))
            # Format results
            products = [format_product(p) for p in raw_products]
        else:
            # Query hai toh Semantic Search AI handle karega
            # (Semantic search already formats products internally)
            products = semantic_search(query)
            
            # Agar query ke sath category dropdown bhi selected hai
            if category_filter:
                products = [p for p in products if category_filter.lower() in p.get('category', '').lower()]

        # --- 2. DYNAMIC DEALS LOGIC (From Code 2) ---
        today = datetime.now().strftime("%Y-%m-%d")
        # Aaj ki active deals uthao
        active_deals = list(mongo.db.deals.find({"expiry": {"$gte": today}}))
        
        # Deal map: {'Electronics': 10, 'Fashion': 20}
        deal_map = {d['category']: int(d['discount']) for d in active_deals}

        # --- 3. PRICE UPDATE & FINAL FORMATTING ---
        for p in products:
            cat = p.get('category')
            original_price = p.get('price', 0)
            
            if cat in deal_map:
                discount = deal_map[cat]
                p['has_deal'] = True
                p['discount_percent'] = discount # Frontend display ke liye
                
                # Dynamic Price Calculation
                # Price field se discount minus karke finalPrice update karo
                p['finalPrice'] = original_price - (original_price * discount / 100)
            else:
                p['has_deal'] = False
                p['discount_percent'] = 0
                # Agar koi deal nahi hai, toh purana finalPrice rakho ya price hi final hai
                p['finalPrice'] = p.get('finalPrice', original_price)

        return jsonify(products), 200

    except Exception as e:
        print(f"--- 🚨 Search Error: {e} ---")
        return jsonify({"error": "Something went wrong in search", "details": str(e)}), 500