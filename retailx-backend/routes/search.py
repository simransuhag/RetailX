from flask import Blueprint, jsonify, request
# Repository se functions import kar rahe hain
from repositories.products_repository import get_all_products

search_bp = Blueprint('search_bp', __name__)

@search_bp.route("/", methods=["GET"])
def search_products():
    query_text = request.args.get('q', '')
    
    if not query_text:
        return jsonify([])

    # 🛠️ DEBUG 1: Pehle check karo search text kya aa raha hai
    print(f"\n--- DEBUG: Searching for text: '{query_text}' ---")

    # Filter ko thoda flexible banate hain
    search_filter = {
        "isActive": True,  # Compass mein check karo icon 'bool' hai ya 'abc'
        "$or": [
            {"name": {"$regex": query_text, "$options": "i"}},
            {"brand": {"$regex": query_text, "$options": "i"}},
            {"category": {"$regex": query_text, "$options": "i"}},
            {"tags": {"$regex": query_text, "$options": "i"}}
        ]
    }
    
    # 🛠️ DEBUG 2: Dekho filter final kaisa dikh raha hai
    print(f"--- DEBUG: Final Filter: {search_filter}")

    try:
        results = get_all_products(query_filter=search_filter, limit=50)
        
        # 🛠️ DEBUG 3: Dekho database se kitne items mile
        print(f"--- DEBUG: Items Found in DB: {len(results)} ---\n")
        
        return jsonify(results)
    except Exception as e:
        print(f"--- ERROR: Search Failed: {str(e)} ---")
        return jsonify({"error": "Internal Server Error"}), 500