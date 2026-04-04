from flask import Blueprint, jsonify
from extensions import mongo # Aapne extensions use kiya tha pehle
from repositories.products_repository import get_products_by_category

# Blueprint setup
product_routes = Blueprint("product_routes", __name__, url_prefix="/api/products")

@product_routes.route("/category/<category_name>", methods=["GET"])
def get_category_products(category_name):
    try:
        # 1. Frontend se aane wale '-' ko space mein badlo (e.g. smart-watches -> smart watches)
        formatted_name = category_name.replace("-", " ")
        
        # 2. Repository se data mangwao jo formatted ho
        products = get_products_by_category(formatted_name)
        
        return jsonify(products), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500