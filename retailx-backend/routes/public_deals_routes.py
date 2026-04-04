from flask import Blueprint, jsonify
from extensions import mongo
from datetime import datetime
from bson import ObjectId

# Prefix set kiya taaki URL clean rahe: /api/public/deals
public_deals_bp = Blueprint("public_deals", __name__, url_prefix="/api/public")

@public_deals_bp.route("/deals", methods=["GET"])
def get_public_deals():
    try:
        today_str = datetime.utcnow().strftime('%Y-%m-%d')
        deals_cursor = mongo.db.deals.find({
            "expiry": {"$gte": today_str},
            "status": "Active"
        }).sort("created_at", -1)
        
        final_deals_list = []

        for d in deals_cursor:
            # 1. Admin ki main deal value uthao (e.g., 25)
            # Isko 'admin_fixed_discount' bolte hain
            try:
                admin_fixed_discount = float(d.get('discount', 0))
            except:
                admin_fixed_discount = 0

            category_name = d.get('category', 'General')
            
            products_cursor = mongo.db.products.find({
                "category": {"$regex": f"^{category_name}$", "$options": "i"},
                "isActive": True
            }).limit(6)
            
            formatted_products = []
            for p in products_cursor:
                # ASALI MRP (899, 1299 etc.)
                mrp = float(p.get('price', 0))
                
                # --- YAHAN HAI FIX ---
                # Hum product ka apna discount (p.get('discount')) BILKUL USE NAHI KARENGE.
                # Hum sirf admin_fixed_discount (25%) use karenge.
                
                new_price = mrp * (1 - (admin_fixed_discount / 100))
                
                formatted_products.append({
                    "id": str(p['_id']),
                    "name": p.get('name', 'Product'),
                    "price": round(mrp, 2),            # Ye 899 dikhayega
                    "finalPrice": round(new_price, 2), # Ye ab 674 dikhayega (899 - 25%)
                    "discount": int(admin_fixed_discount), # Ye 25 dikhayega
                    "imageURL": p.get('imageURL') or p.get('image') or ""
                })

            d['_id'] = str(d['_id'])
            d['products'] = formatted_products
            d['discount'] = int(admin_fixed_discount) 
            final_deals_list.append(d)

        return jsonify(final_deals_list), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500