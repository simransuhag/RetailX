from flask_jwt_extended import create_access_token
from flask import Blueprint, redirect, jsonify, request
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
import jwt, datetime, os  # ← YE ADD KARO TOP PE

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"  # ← YE ADD KARO TOP PE

google_callback_bp = Blueprint("google_auth", __name__)

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

flow = Flow.from_client_config(
    {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": ["http://localhost:5000/api/auth/google/callback"]
        }
    },
    scopes=[
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
    ],
    redirect_uri="http://localhost:5000/api/auth/google/callback"
)

@google_callback_bp.route("/api/auth/google/login")
def google_login():
    authorization_url, state = flow.authorization_url()
    return redirect(authorization_url)

@google_callback_bp.route("/api/auth/google/callback")
def google_callback():
    flow.fetch_token(authorization_response=request.url)
    credentials = flow.credentials

    from google.oauth2 import id_token
    import google.auth.transport.requests
    request_session = google.auth.transport.requests.Request()

    id_info = id_token.verify_oauth2_token(
        credentials.id_token,
        request_session,
        GOOGLE_CLIENT_ID
    )

    user_email = id_info["email"]
    user_name  = id_info.get("name", "Shopper")

    from extensions import mongo
    existing_user = mongo.db.users.find_one({"email": user_email})

    if not existing_user:
        mongo.db.users.insert_one({
            "name": user_name,
            "email": user_email,
            "password": None,
            "role": "customer",
            "auth_provider": "google",
            "preferences": []
        })
        redirect_path = "/preferences"
    else:
        redirect_path = "/customer-dashboard"

    # token = jwt.encode({
    #     "email": user_email,
    #     "name":  user_name,
    #     "exp":   datetime.datetime.utcnow() + datetime.timedelta(days=7)
    # }, os.environ.get("JWT_SECRET_KEY", "supersecret"), algorithm="HS256")

    token = create_access_token(identity=user_email)

    user_id = str(existing_user['_id']) if existing_user else str(mongo.db.users.find_one({"email": user_email})['_id'])

    return redirect(f"{FRONTEND_URL}/oauth-success?token={token}&id={user_id}&name={user_name}&redirect={redirect_path}")