from flask import Blueprint, jsonify, request
from extensions import mongo
from repositories.products_repository import get_all_products, format_product
from bson import ObjectId
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import cross_origin

# Prefix "/" hi rakha hai kyunki tu frontend change nahi karna chahta tha
product_bp = Blueprint('product_bp', __name__)

# --- 🔍 PUBLIC ROUTES ---

@product_bp.route("/api/product/<id>", methods=["GET"])
def get_single_product(id):
    try:
        if not ObjectId.is_valid(id):
            return jsonify({"error": "Invalid ID format"}), 400

        query_id = ObjectId(id)
        product = mongo.db.products.find_one({"_id": query_id})
        
        if product:
            # Consistent formatting for frontend
            return jsonify(format_product(product)), 200
        
        return jsonify({"error": "Product not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@product_bp.route("/api/products", methods=["GET"])
def get_products():
    category_name = request.args.get('category')
    limit = int(request.args.get('limit', 20))
    exclude_id = request.args.get('exclude') 
    
    query = {"isActive": True}
    if category_name:
        query["category"] = {"$regex": f"^{category_name}$", "$options": "i"}
    if exclude_id:
        try:
            query["_id"] = {"$ne": ObjectId(exclude_id)}
        except:
            pass 

    products = get_all_products(query_filter=query, limit=limit)
    return jsonify(products)


# --- 🏪 SELLER SPECIFIC ROUTES ---

@product_bp.route('/add', methods=['POST'])
@jwt_required()
@cross_origin()
def add_product():
    try:
        seller_email = get_jwt_identity()
        data = request.json
        
        if not data.get('name') or not data.get('price'):
            return jsonify({"msg": "Name and Price are required"}), 400

        price = float(data.get('price', 0))
        discount = float(data.get('discount', 0))
        final_price = price - (price * (discount / 100))

        new_product = {
            "name": data.get('name'),
            "description": data.get('description', ""),
            "category": data.get('category', "Other"),
            "subCategory": data.get('subCategory', ""), # Frontend match
            "brand": data.get('brand', "Generic"),
            "price": price,
            "discount": discount,
            "finalPrice": final_price,
            "stock": int(data.get('stock', 0)),
            "rating": 0,
            "reviewsCount": 0,
            "imageURL": data.get('imageURL', ""),
            "seller_email": seller_email,
            "isActive": True,
            "highlights": data.get('highlights', []),
            "specs": data.get('specs', {}),
            "tags": data.get('tags', []),
            "images": data.get('images', [])
        }

        mongo.db.products.insert_one(new_product)
        return jsonify({"msg": "Product Added Successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@product_bp.route('/seller', methods=['GET'])
@jwt_required()
@cross_origin()
def get_seller_products():
    try:
        seller_email = get_jwt_identity()
        # MongoDB se products nikale
        products = list(mongo.db.products.find({"seller_email": seller_email}))
        
        # Format_product use karke bhej rahe hain taaki "_id" ki jagah "id" mile (Frontend requirement)
        return jsonify([format_product(p) for p in products]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@product_bp.route('/delete/<id>', methods=['DELETE'])
@jwt_required()
@cross_origin()
def delete_product(id):
    try:
        seller_email = get_jwt_identity()
        if not ObjectId.is_valid(id):
            return jsonify({"error": "Invalid ID"}), 400
            
        result = mongo.db.products.delete_one({
            "_id": ObjectId(id), 
            "seller_email": seller_email
        })
        
        if result.deleted_count == 1:
            return jsonify({"msg": "Product deleted"}), 200
        return jsonify({"msg": "Product not found or unauthorized"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@product_bp.route('/update/<id>', methods=['PUT'])
@jwt_required()
@cross_origin()
def update_product(id):
    try:
        seller_email = get_jwt_identity()
        data = request.json
        
        if not ObjectId.is_valid(id):
            return jsonify({"error": "Invalid ID"}), 400

        # Agar price ya discount update ho raha hai, toh finalPrice recalculate karo
        if 'price' in data or 'discount' in data:
            current = mongo.db.products.find_one({"_id": ObjectId(id)})
            if current:
                price = float(data.get('price', current.get('price', 0)))
                discount = float(data.get('discount', current.get('discount', 0)))
                data['finalPrice'] = price - (price * (discount / 100))
        
        if 'stock' in data:
            data['stock'] = int(data['stock'])

        # _id ko update query se bahar rakho
        update_data = {k: v for k, v in data.items() if k not in ['_id', 'id']}
        
        result = mongo.db.products.update_one(
            {"_id": ObjectId(id), "seller_email": seller_email},
            {"$set": update_data}
        )
        
        if result.matched_count == 1:
            return jsonify({"msg": "Product updated"}), 200
        return jsonify({"msg": "Unauthorized or not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500