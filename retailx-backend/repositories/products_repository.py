from extensions import mongo
from bson import ObjectId

def format_product(p):
    if not p:
        return None
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

def get_all_products(query_filter=None, limit=20):
    query = query_filter if query_filter else {"isActive": True}
    products = mongo.db.products.find(query).limit(limit)
    return [format_product(p) for p in products]

def get_product_by_id(product_id):
    try:
        product = mongo.db.products.find_one({"_id": ObjectId(product_id)})
        return format_product(product)
    except:
        return None