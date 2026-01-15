from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import mongo

preferences_bp = Blueprint("preferences", __name__, url_prefix="/api")

@preferences_bp.route("/preferences", methods=["POST"])
@jwt_required()
def save_preferences():
    data = request.json
    categories = data.get("categories", [])

    if len(categories) < 3:
        return jsonify({"message": "Select at least 3 categories"}), 400

    email = get_jwt_identity() 

    mongo.db.users.update_one(
        {"email": email},
        {"$set": {"preferences": categories}}
    )

    return jsonify({"message": "Preferences saved successfully"}), 200