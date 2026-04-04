from extensions import mongo
from bson import ObjectId
from datetime import datetime # <--- Ye add karo
import re


def format_product(p):
    if not p: return None
    
    # --- DYNAMIC DEAL LOGIC START ---
    today = datetime.now().strftime("%Y-%m-%d")
    # Check karo kya is category par koi active deal hai
    active_deal = mongo.db.deals.find_one({
        "category": p.get("category"),
        "expiry": {"$gte": today}
    })
    
    # Default values (jo DB mein hain)
    original_price = p.get("price", 0)
    db_discount = p.get("discount", 0)
    final_price = p.get("finalPrice", original_price)
    has_active_deal = False

    # Agar Deal mil gayi, toh DB waale discount ko override karo
    if active_deal:
        deal_discount = int(active_deal.get("discount", 0))
        final_price = original_price - (original_price * deal_discount / 100)
        db_discount = deal_discount
        has_active_deal = True
    # --- DYNAMIC DEAL LOGIC END ---

    return {
        "id": str(p.get("_id")),
        "name": p.get("name"),
        "description": p.get("description"),
        "category": p.get("category"),
        "subCategory": p.get("subCategory"),
        "brand": p.get("brand"),
        "price": original_price,
        "discount": db_discount, # Ye ab dynamic deal wala discount dikhayega
        "finalPrice": final_price, # Ye ab calculated price dikhayega
        "hasDeal": has_active_deal, # Frontend ko batane ke liye
        "stock": p.get("stock", 0),
        "rating": p.get("rating", 0),
        "reviewsCount": p.get("reviewsCount", 0),
        "imageURL": p.get("imageURL") or (p.get("images", [""])[0] if p.get("images") else ""),
        "tags": p.get("tags", []),
        "isActive": p.get("isActive", True),
        "highlights": p.get("highlights", []),
        "specs": p.get("specs", {}),
        "aiMetadata": p.get("aiMetadata", {}),
        "images": p.get("images", [])
    }



def get_all_products():
    products = mongo.db.products.find({"isActive": True})
    return [format_product(p) for p in products]


def get_product_by_id(product_id):
    product = mongo.db.products.find_one({"_id": ObjectId(product_id)})
    return format_product(product)

def get_products_by_search(search_query):
    # Regex makes it case-insensitive (toys matches Toys)
    regex = re.compile(search_query, re.IGNORECASE)
    
    # Search in name, category, OR brand
    products = mongo.db.products.find({
        "isActive": True,
        "$or": [
            {"name": regex},
            {"category": regex},
            {"brand": regex}
        ]
    })
    return [format_product(p) for p in products]

def get_products_by_category(category_name):
    # Case-insensitive exact match for category
    regex = re.compile(f"^{category_name}$", re.IGNORECASE)
    products = mongo.db.products.find({"category": regex, "isActive": True})
    return [format_product(p) for p in products]