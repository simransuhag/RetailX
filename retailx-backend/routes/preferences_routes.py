from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import pymongo
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI") or "mongodb://localhost:27017"
client = pymongo.MongoClient(MONGO_URI)
db = client["retailxDB"]
users_collection = db["users"]

preferences_bp = Blueprint("preferences", __name__, url_prefix="/api")

@preferences_bp.route("/preferences", methods=["POST"])
@jwt_required()
def save_preferences():
    data = request.json
    categories = data.get("categories", [])

    if len(categories) < 3:
        return jsonify({"message": "Select at least 3 categories"}), 400

    email = get_jwt_identity()  # string from JWT

    users_collection.update_one(
        {"email": email},
        {"$set": {"preferences": categories}}
    )

    return jsonify({"message": "Preferences saved successfully"}), 200