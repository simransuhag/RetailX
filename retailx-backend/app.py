from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

# Extensions
from extensions import mongo, bcrypt, jwt

# Saare Blueprints (Aapke aur uske mix kiye hain jo zaroori hain)
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.seller_routes import seller_bp
from routes.preferences_routes import preferences_bp
from routes.products import product_bp 
from routes.search import search_bp
from routes.chat import chat_bp
# Uske extra important blueprints jo e-commerce ke liye chahiye
from routes.payment_routes import payment_bp
from routes.user_routes import user_bp
from routes.order import orders_bp
from routes.recommendations import recommendation_bp
from routes.cart_routes import cart_bp 
from routes.wishlist_routes import wishlist_bp

app = Flask(__name__)

# 🌐 CORS - Isse aapka React (5173) backend (5000) se baat kar payega
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# ⚙️ CONFIG
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

# JWT Configuration
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"

# 🛠️ INIT EXTENSIONS
mongo.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)

# 🛣️ REGISTER BLUEPRINTS (URLs Fixed!)

# 1. Auth & Profiles
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(seller_bp, url_prefix="/api/seller")
app.register_blueprint(user_bp, url_prefix="/api/user") # Added User profile logic

# 2. Products & Search
# IMPORTANT: Aapke products.py mein pehle se "/api/products" likha hai, 
# isliye prefix "/" hi rakha hai taaki URL double na ho jaye (/api/products/api/products)
app.register_blueprint(product_bp, url_prefix="/api/products") # Aapka updated products logic
app.register_blueprint(search_bp, url_prefix="/api/search")
app.register_blueprint(recommendation_bp, url_prefix="/api/recommendations")
app.register_blueprint(wishlist_bp, url_prefix="/api/wishlist")

# 3. Features (Cart, Order, Payment)
app.register_blueprint(preferences_bp, url_prefix="/api")
app.register_blueprint(cart_bp, url_prefix="/api/cart")
app.register_blueprint(orders_bp, url_prefix="/api/orders")
app.register_blueprint(payment_bp, url_prefix="/api/payment")
app.register_blueprint(chat_bp, url_prefix="/api/chat")

# 🛠️ Test Route for your Laptop
@app.route("/api/test-db")
def test_db():
    try:
        mongo.db.test.insert_one({"msg": "RetailXDB is connected!"})
        return jsonify({"status": "Success", "database": "Connected to MongoDB"}), 200
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500

@app.route("/")
def home():
    return "RetailX Backend is Live 🚀"

if __name__ == "__main__":
    # Debug=True laptop par development ke liye best hai
    app.run(debug=True, port=5000)