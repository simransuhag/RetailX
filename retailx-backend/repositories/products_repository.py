from extensions import mongo
from bson import ObjectId
import re

def format_product(p):
    if not p: return None
    return {
        "id": str(p.get("_id")),
        "name": p.get("name"),
        "description": p.get("description"),
        "category": p.get("category"),
        "subCategory": p.get("subCategory"),
        "brand": p.get("brand"),
        "price": p.get("price"),
        "discount": p.get("discount", 0),
        "finalPrice": p.get("finalPrice"),
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

# --- APKA FLEXIBLE LOGIC ---
def get_all_products(query_filter=None, limit=50):
    query = query_filter if query_filter else {"isActive": True}
    products = mongo.db.products.find(query).limit(limit)
    return [format_product(p) for p in products]

def get_product_by_id(product_id):
    try:
        product = mongo.db.products.find_one({"_id": ObjectId(product_id)})
        return format_product(product)
    except:
        return None

# --- USKE EXTRA FEATURES (Cleaned Up) ---
def get_products_by_category(category_name):
    regex = re.compile(f"^{category_name}$", re.IGNORECASE)
    # Hum apna hi get_all_products call kar rahe hain yahan (Reusability!)
    return get_all_products(query_filter={"category": regex, "isActive": True})

def get_products_by_search(search_query):
    regex = re.compile(search_query, re.IGNORECASE)
    search_filter = {
        "isActive": True,
        "$or": [
            {"name": regex},
            {"category": regex},
            {"brand": regex},
            {"tags": regex}
        ]
    }
    return get_all_products(query_filter=search_filter)