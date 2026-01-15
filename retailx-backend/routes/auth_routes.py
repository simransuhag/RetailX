from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from extensions import mongo, bcrypt
import re

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

PASSWORD_REGEX = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$')

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    if not PASSWORD_REGEX.match(password):
        return jsonify({"message": "Password weak hai! 8+ chars, Upper, Lower aur Special char dalo."}), 400

    # mongo.db use karne se ye automatically retailxdb use karega
    if mongo.db.users.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    mongo.db.users.insert_one({
        "email": email,
        "password": hashed_password,
        "preferences": [],
        "role": "user"
    })

    access_token = create_access_token(identity=email)
    return jsonify({"message": "Registration successful", "token": access_token}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = mongo.db.users.find_one({"email": email})

    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid credentials"}), 401

    access_token = create_access_token(identity=email)
    return jsonify({"message": "Login successful", "token": access_token}), 200