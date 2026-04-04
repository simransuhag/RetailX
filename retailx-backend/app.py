from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

from extensions import mongo, bcrypt, jwt, mail

# Existing routes
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.seller_routes import seller_bp
from routes.preferences_routes import preferences_bp

# New routes
from routes.products import product_bp
from routes.search import search_bp
from routes.chat import chat_bp
from routes.recommendations import recommendation_bp
from routes.cart_routes import cart_bp  # <--- UPDATED: Cart import kiya

from routes.payment_routes import payment_bp
from routes.user_routes import user_bp
from routes.order import orders_bp
from routes.wishlist_routes import wishlist_bp


from routes.admin_ops import admin_ops_bp
from routes.public_deals_routes import public_deals_bp
from routes.public_ops import public_ops_bp

from routes.complaint_routes import complaint_bp
from routes.oauth import google_callback_bp


load_dotenv()

app = Flask(__name__)
# ✅ REPLACE CORS(app) WITH THIS STRONGER CONFIG:
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
        "allow_headers": ["Content-Type", "Authorization"],#, "Access-Control-Allow-Origin"],
        "supports_credentials": True
    }
})

# @app.after_request
# def after_request(response):
#     response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#     response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
#     response.headers.add('Access-Control-Allow-Credentials', 'true')
#     return response
# CORS(app, resources={r"/api/*": {"origins": "*"}})


# CONFIG
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"

app.config["JWT_ERROR_MESSAGE_KEY"] = "message"
app.config["JWT_OPTIONS_IN_REQUEST"] = False
app.config["OAUTHLIB_INSECURE_TRANSPORT"] = "1"  # local dev only
app.secret_key = os.getenv("SECRET_KEY")  # ← YE ADD KARO

app.config.update(
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=465,
    MAIL_USE_SSL=True,
    MAIL_USERNAME='adminretailx01@gmail.com',
    MAIL_PASSWORD='emtoaozuoefnkzep'
)
mail.init_app(app)
# INIT EXTENSIONS
mongo.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)

# REGISTER ALL BLUEPRINTS
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(seller_bp, url_prefix="/api/seller")
app.register_blueprint(preferences_bp, url_prefix="/api")

app.register_blueprint(product_bp, url_prefix="/api/products")
app.register_blueprint(search_bp, url_prefix="/api")
app.register_blueprint(chat_bp, url_prefix="/api/chat")
app.register_blueprint(recommendation_bp, url_prefix="/api/recommendations")

app.register_blueprint(payment_bp)
app.register_blueprint(user_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(google_callback_bp)

# UPDATED: Cart Blueprint register kiya (Iska prefix /api/cart already route file mein set hai)
app.register_blueprint(cart_bp) 
app.register_blueprint(wishlist_bp, url_prefix='/api/wishlist')


app.register_blueprint(public_deals_bp, url_prefix='/api/deals') # Your current focus 🎯
app.register_blueprint(admin_ops_bp, url_prefix='/api/admin_ops')
app.register_blueprint(public_ops_bp, url_prefix='/api/public')
app.register_blueprint(complaint_bp)




@app.route("/")
def home():
    return "RetailX Backend Running 🚀"

if __name__ == "__main__":
    with app.app_context():
        try:
            # DB check logic
            db_name = mongo.db.name if mongo.db is not None else "Unknown"
            print(f"✅ Connected to Database: {db_name}")
        except Exception as e:
            print(f"❌ DB Connection Error: {e}")
            
    app.run(debug=True)