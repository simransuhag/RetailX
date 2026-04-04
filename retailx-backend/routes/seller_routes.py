from datetime import datetime  # <--- Ye line bilkul top par honi chahiye
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import mongo, bcrypt
from models.seller_model import Seller 
from flask_cors import cross_origin
from bson import ObjectId

seller_bp = Blueprint("seller", __name__)

# 📝 REGISTER SELLER
@seller_bp.route("/register", methods=["POST", "OPTIONS"])
@cross_origin()
def register_seller():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        storeName = data.get("storeName")
        registrationId = data.get("registrationId")

        if not all([email, password, storeName, registrationId]):
            return jsonify({"message": "All fields should be filled to continue!"}), 400

        if Seller.find_by_email(email):
            return jsonify({"message": "Seller is already registered!"}), 409

        hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
        
        # Method call with hashed password
        Seller.create_seller(email, hashed_pw, storeName, registrationId)

        token = create_access_token(identity=email, additional_claims={"role": "seller"})
        
        return jsonify({"message": "Seller registered successfully", "token": token}), 201
    except Exception as e:
        print(f"Register Error: {e}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500

# 🔑 LOGIN SELLER
@seller_bp.route("/login", methods=["POST", "OPTIONS"])
@cross_origin()
def login_seller():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"message": "Both email and password are required!"}), 400

        seller = Seller.find_by_email(email)

        if not seller or not bcrypt.check_password_hash(seller["password"], password):
            return jsonify({"message": "Invalid credentials"}), 401

        token = create_access_token(identity=email, additional_claims={"role": "seller"})
        
        return jsonify({
            "message": "Login successful", 
            "token": token,
            "seller": {"email": email, "storeName": seller.get("storeName")}
        }), 200
    except Exception as e:
        print(f"Login Error: {e}")
        return jsonify({"message": "Server error during login"}), 500

# --- 📦 GET ALL PRODUCTS (INVENTORY) ---
# Final Route: GET /api/seller/inventory
@seller_bp.route("/inventory", methods=["GET"])
@jwt_required()
@cross_origin()
def get_inventory():
    try:
        current_seller_email = get_jwt_identity()
        # Sirf wahi products dikhao jo is logged-in seller ke hain
        products = list(mongo.db.products.find({"seller_email": current_seller_email}))
        for p in products:
            p["_id"] = str(p["_id"])
        return jsonify(products), 200
    except Exception as e:
        return jsonify({"message": f"Server Error: {str(e)}"}), 500

# --- ➕ ADD PRODUCT ---
# Final Route: POST /api/seller/product/add
@seller_bp.route("/product/add", methods=["POST"])
@jwt_required()
@cross_origin()
def add_product():
    try:
        data = request.json
        seller_email = get_jwt_identity()
        
        # Numbers convert kar rahe hain calculations ke liye
        price = float(data.get('price', 0))
        discount = float(data.get('discount', 0))
        final_price = price - (price * (discount / 100))

        # Frontend se tags 'string' mein aa sakte hain (comma separated), unhe list mein convert karo
        # tags_raw = data.get('tags', [])
        # tags_list = [t.strip() for t in tags_raw.split(",")] if isinstance(tags_raw, str) else tags_raw

        # Backend logic to handle both "string" and ["array"]
        tags_data = data.get('tags', [])

        if isinstance(tags_data, str):
            # Agar user ne "shampoo, organic" bheja toh array ban jayega ["shampoo", "organic"]
            # Agar sirf "shampoo" bheja toh ["shampoo"] ban jayega
            tags_list = [t.strip() for t in tags_data.split(",") if t.strip()]
        elif isinstance(tags_data, list):
            tags_list = tags_data
        else:
            tags_list = []

        # # Phir database mein tags_list ko save karo
        # "tags": tags_list

        new_product = {
            "name": data.get('name'),
            "brand": data.get('brand', "Generic"),
            "price": price,
            "discount": discount,
            "finalPrice": final_price,
            "stock": int(data.get('stock', 0)),
            "rating": 0,
            "imageURL": data.get('imageURL', ""),
            "description": data.get('description', ""),
            "category": data.get('category', "Other"),
            "subCategory": data.get('subCategory', ""),
            "seller_email": seller_email, # Isse connect hota hai product seller se
            "isActive": True,
            "tags": tags_list,
            "highlights": data.get('highlights', []), # Expecting Array from frontend
            "specs": data.get('specs', {}),           # Expecting Object from frontend
            "createdAt":datetime.utcnow() # Better to use datetime.utcnow()
        }
        
        result = mongo.db.products.insert_one(new_product)
        return jsonify({"message": "Product Live ho gaya!", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# --- 🔄 UPDATE PRODUCT ---
# Final Route: PUT /api/seller/product/update/<id>
@seller_bp.route("/product/update/<id>", methods=["PUT"])
@jwt_required()
@cross_origin()
def update_product(id):
    try:
        data = request.json
        price = float(data.get('price', 0))
        discount = float(data.get('discount', 0))
        tags_data = data.get('tags', [])

        if isinstance(tags_data, str):
            # Agar user ne "shampoo, organic" bheja toh array ban jayega ["shampoo", "organic"]
            # Agar sirf "shampoo" bheja toh ["shampoo"] ban jayega
            tags_list = [t.strip() for t in tags_data.split(",") if t.strip()]
        elif isinstance(tags_data, list):
            tags_list = tags_data
        else:
            tags_list = []
        
        update_data = {
            "name": data.get('name'),
            "description": data.get('description'),
            "category": data.get('category'),
            "subCategory": data.get('subCategory'),
            "brand": data.get('brand'),
            "price": price,
            "discount": discount,
            "finalPrice": price - (price * (discount / 100)),
            "stock": int(data.get('stock', 0)),
            "imageURL": data.get('imageURL'),
            "tags": tags_list,
            "highlights": data.get('highlights', []),
            "specs": data.get('specs', {})

        }
        
        # Product ID se dhoond kar update karo
        result = mongo.db.products.update_one(
            {"_id": ObjectId(id)}, 
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({"message": "Product nahi mila"}), 404

        return jsonify({"message": "Product details updated successfully"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# --- 🗑️ DELETE PRODUCT ---
# Final Route: DELETE /api/seller/product/delete/<id>
@seller_bp.route("/product/delete/<id>", methods=["DELETE"])
@jwt_required()
@cross_origin()
def delete_product(id):
    try:
        result = mongo.db.products.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"message": "Product already deleted or not found"}), 404
            
        return jsonify({"message": "Product removed from market"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# --- 📦 UPDATE STOCK ONLY (Fast Action) ---
# Final Route: PATCH /api/seller/product/update-stock/<id>
@seller_bp.route("/product/update-stock/<id>", methods=["PATCH"])
@jwt_required()
@cross_origin()
def update_stock(id):
    try:
        new_stock = request.json.get('stock')
        mongo.db.products.update_one(
            {"_id": ObjectId(id)}, 
            {"$set": {"stock": int(new_stock)}}
        )
        return jsonify({"message": "Stock updated"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500





# 👤 GET SELLER PROFILE
@seller_bp.route("/profile", methods=["GET", "OPTIONS"])
@jwt_required()
@cross_origin()
def get_seller_profile():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    try:
        current_user_email = get_jwt_identity()
        seller = mongo.db.sellers.find_one({"email": current_user_email}, {"password": 0}) 
        if not seller:
            return jsonify({"message": "Seller not found"}), 404
        
        seller["_id"] = str(seller["_id"])
        return jsonify(seller), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# ✨ UPDATE SELLER PROFILE
@seller_bp.route("/profile/update", methods=["PUT", "OPTIONS"])
@jwt_required()
@cross_origin()
def update_seller_profile():
    # CORS Pre-flight handle karne ke liye
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        current_user_email = get_jwt_identity()
        data = request.json
        
        # Database fields update logic
        update_fields = {}
        
        # List of all allowed fields to update
        allowed_fields = [
            "storeName", "businessAddress", "contactNumber", 
            "gstin", "businessType"
        ]

        for field in allowed_fields:
            if field in data:
                update_fields[field] = data[field]

        # Security Check: RegistrationId aur Email update nahi hone chahiye
        if "registrationId" in update_fields:
            del update_fields["registrationId"]
        if "email" in update_fields:
            del update_fields["email"]

        if not update_fields:
            return jsonify({"message": "No valid data provided for update"}), 400

        result = mongo.db.sellers.update_one(
            {"email": current_user_email},
            {"$set": update_fields}
        )

        if result.matched_count > 0:
            return jsonify({
                "message": "Profile updated successfully!",
                "updated_data": update_fields
            }), 200
        else:
            return jsonify({"message": "Seller account not found"}), 404

    except Exception as e:
        print(f"Update Profile Error: {e}")
        return jsonify({"message": f"Server Error: {str(e)}"}), 500
    
# --- 📦 GET SELLER ORDERS ---
# Final Route: GET /api/seller/orders
@seller_bp.route("/orders", methods=["GET"])
@jwt_required()
@cross_origin()
def get_seller_orders():
    try:
        current_seller_email = get_jwt_identity()
        
        # 1. Wo orders dhoondo jisme kam se kam ek product iss seller ka ho
        # Query: items list ke andar kisi bhi object ka seller_email match hona chahiye
        query = {"items": {"$elemMatch": {"seller_email": current_seller_email}}}
        
        all_orders = list(mongo.db.orders.find(query).sort("created_at", -1))

        formatted_orders = []
        for order in all_orders:
            # 2. Filter: Order mein se sirf wahi items nikaalo jo iss seller ke hain
            # Kyunki ek order mein multiple sellers ke products ho sakte hain
            my_items = [item for item in order["items"] if item.get("seller_email") == current_seller_email]
            
            if my_items:
                formatted_orders.append({
                    "_id": str(order["_id"]),
                    "customer_email": order.get("email"),
                    "my_items": my_items,
                    "status": order.get("status"),
                    "total_order_value": order.get("total"),
                    "address": order.get("address"),
                    "created_at": order.get("created_at")
                })

        return jsonify(formatted_orders), 200
    except Exception as e:
        print(f"Orders Fetch Error: {e}")
        return jsonify({"message": f"Server Error: {str(e)}"}), 500