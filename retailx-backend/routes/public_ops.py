from flask import Blueprint, jsonify
from extensions import mongo
from datetime import datetime

public_ops_bp = Blueprint("public_ops", __name__)

@public_ops_bp.route("/deals", methods=["GET"])
def get_public_deals():
    try:
        today_str = datetime.utcnow().strftime('%Y-%m-%d')
        
        pipeline = [
            {
                "$match": {
                    "status": "Active",
                    "expiry": {"$gte": today_str}
                }
            },
            {
                "$lookup": {
                    "from": "products",
                    "localField": "category",
                    "foreignField": "category",
                    "as": "raw_products" # Pehle raw products uthao
                }
            },
            {"$sort": {"created_at": -1}}
        ]
        
        deals = list(mongo.db.deals.aggregate(pipeline))
        
        for d in deals:
            d['_id'] = str(d['_id'])
            # Admin ne jo discount set kiya hai (e.g., 25)
            admin_discount = float(d.get('discount', 0))
            
            formatted_products = []
            # Sirf active products uthao aur top 4 rakho
            raw_list = [p for p in d.get('raw_products', []) if p.get('isActive')]
            
            for p in raw_list[:6]:
                mrp = float(p.get('price', 0))
                
                # 🔥 YAHAN CALCULATION FORCE KARO
                # Naya sasta price = MRP - (MRP * Admin Discount / 100)
                new_final_price = mrp * (1 - (admin_discount / 100))
                
                formatted_products.append({
                    "id": str(p['_id']),
                    "name": p.get('name', 'Product'),
                    "price": round(mrp, 2),            # Original Price
                    "finalPrice": round(new_final_price, 2), # Correct Discounted Price
                    "discount": int(admin_discount),    # Force Admin's Deal %
                    "imageURL": p.get('imageURL') or p.get('image') or ""
                })
            
            # Final clean object
            d['products'] = formatted_products
            d.pop('raw_products', None) # Purana kachra hata do

        return jsonify(deals), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"message": str(e)}), 500