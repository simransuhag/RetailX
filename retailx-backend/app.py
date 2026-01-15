from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Extensions
from extensions import mongo, bcrypt, jwt

# Saare Blueprints
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.seller_routes import seller_bp
from routes.preferences_routes import preferences_bp
from routes.products import product_bp 
from routes.search import search_bp
from routes.chat import chat_bp

load_dotenv()

app = Flask(__name__)

# 🌐 CORS Configuration
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# ⚙️ CONFIG
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["MONGO_DBNAME"] = "retailxDB"

app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"

# 🛠️ INIT EXTENSIONS
mongo.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)

# 🛣️ REGISTER BLUEPRINTS
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(seller_bp, url_prefix="/api/seller")
app.register_blueprint(preferences_bp, url_prefix="/api")
app.register_blueprint(product_bp, url_prefix="/")
app.register_blueprint(search_bp, url_prefix="/api/search")
app.register_blueprint(chat_bp, url_prefix="/api/chat")

@app.route("/api/test-db")
def test_db():
    try:
        mongo.db.test.insert_one({"msg": "RetailXDB is connected!"})
        return jsonify({"status": "Success", "database": "retailxdb connected"}), 200
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500

@app.route("/")
def home():
    return "RetailX Backend Running 🚀"

if __name__ == "__main__":
    app.run(debug=True, port=5000)