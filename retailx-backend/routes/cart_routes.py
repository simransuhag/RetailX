from flask import Blueprint, request, jsonify
from models.cart_model import Cart
from bson import ObjectId

cart_bp = Blueprint("cart", __name__, url_prefix="/api/cart")

# Helper function to handle OPTIONS for CORS
def handle_options():
    return jsonify({"status": "ok"}), 200

@cart_bp.route("/", methods=["GET", "OPTIONS"])
def get_cart():
    if request.method == "OPTIONS": return handle_options()
    
    user_id = request.args.get("userId")
    if not user_id: return jsonify({"error": "userId required"}), 400
    
    cart = Cart.find_by_user(user_id)
    if not cart:
        Cart.create_cart(user_id)
        cart = Cart.find_by_user(user_id)
        
    spent_data = Cart.calculate_spent(cart)
    return jsonify({
        "items": cart.get("items", []), 
        "monthlyBudget": cart.get("monthlyBudget", 2000), 
        **spent_data
    })

@cart_bp.route("/add", methods=["POST", "OPTIONS"])
def add_item():
    if request.method == "OPTIONS": return handle_options()
    
    data = request.json
    # ✅ Ab hum pura data object bhej rahe hain model ko
    # Model isme se name, imageURL, etc. nikal lega
    res, status = Cart.add_item(data.get("userId"), data)
    
    if status != 200: return jsonify(res), status
    
    cart = Cart.find_by_user(data.get("userId"))
    return jsonify({"items": cart.get("items", []), **Cart.calculate_spent(cart)})

@cart_bp.route("/update", methods=["POST", "OPTIONS"])
def update_quantity():
    if request.method == "OPTIONS": return handle_options()
    
    data = request.json
    from extensions import mongo
    
    # Quantity update logic
    mongo.db.carts.update_one(
        {"userId": ObjectId(data.get("userId")), "items.productId": data.get("productId")},
        {"$set": {"items.$.quantity": data.get("quantity")}}
    )
    
    cart = Cart.find_by_user(data.get("userId"))
    return jsonify({"items": cart.get("items", []), **Cart.calculate_spent(cart)})

@cart_bp.route("/remove", methods=["POST", "OPTIONS"])
def remove_item():
    if request.method == "OPTIONS": return handle_options()
    
    data = request.json
    # Model mein humne $pull use kiya hai, toh budget safe rahega
    Cart.remove_item(data.get("userId"), data.get("productId"))
    
    cart = Cart.find_by_user(data.get("userId"))
    return jsonify({"items": cart.get("items", []), **Cart.calculate_spent(cart)})

@cart_bp.route("/budget", methods=["POST", "OPTIONS"])
def set_budget():
    if request.method == "OPTIONS": return handle_options()
    
    data = request.json
    Cart.update_budget(data.get("userId"), data.get("monthlyBudget"))
    
    cart = Cart.find_by_user(data.get("userId"))
    return jsonify({
        "items": cart.get("items", []), # Items bhi bhejo taaki UI sync rahe
        "monthlyBudget": cart.get("monthlyBudget"),
        **Cart.calculate_spent(cart)
    })