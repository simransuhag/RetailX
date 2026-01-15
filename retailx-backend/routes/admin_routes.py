from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from extensions import bcrypt  # Ensure your extensions file has bcrypt
from models.admin_model import Admin
import os
import re

admin_bp = Blueprint("admin", __name__)

# 🔐 Password Strength Checker (Logic simplified for readability)
def is_strong_password(password):
    # Kam se kam 8 chars, 1 Uppercase, 1 Lowercase, 1 Number, 1 Special Char
    pattern = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
    return re.match(pattern, password)

# 📝 ADMIN REGISTER
@admin_bp.route("/register", methods=["POST"])
def register_admin():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        admin_key = data.get("adminKey") # Ye secret key hai registration rokne ke liye

        # 1. Check if fields are missing
        if not all([email, password, admin_key]):
            return jsonify({"message": "Bhai, saari fields bharna zaroori hai!"}), 400

        # 2. 🔐 Verify Admin Secret Key (Check from .env file)
        # Tere .env mein ADMIN_SECRET_KEY hona chahiye
        if admin_key != os.getenv("ADMIN_SECRET_KEY"):
            return jsonify({"message": "Invalid Admin Secret Key. Aap admin nahi ban sakte!"}), 403

        # 3. Check Password Strength
        if not is_strong_password(password):
            return jsonify({
                "message": "Password kam se kam 8 chars ka hona chahiye (Upper, Lower, Number aur Special char ke saath)"
            }), 400

        # 4. Check if Admin already exists
        if Admin.find_by_email(email):
            return jsonify({"message": "Admin pehle se hi registered hai!"}), 400

        # 5. Hash Password & Create
        hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")
        Admin.create_admin(email, hashed_pw)

        # 6. Generate Token
        token = create_access_token(identity={"email": email, "role": "admin"})
        return jsonify({"token": token, "message": "Admin registration successful!"}), 201
    
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500


# 🔓 ADMIN LOGIN
@admin_bp.route("/login", methods=["POST"])
def login_admin():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email aur password dono chahiye!"}), 400

    admin = Admin.find_by_email(email)
    
    # 1. User check and Password verification
    if not admin or not bcrypt.check_password_hash(admin["password"], password):
        return jsonify({"message": "Email ya Password galat hai!"}), 401

    # 2. Token generation
    token = create_access_token(identity={"email": email, "role": "admin"})
    return jsonify({
        "token": token, 
        "message": "Welcome back Admin!",
        "admin": {"email": email} # Frontend ke liye thodi info
    }), 200