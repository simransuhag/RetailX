from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import mongo
from models.order_model import Order
from models.user_model import User
from bson.objectid import ObjectId # Zaroori: ObjectId conversion ke liye
import os
import stripe
from datetime import datetime
from utils.email_utils import send_order_email  # <--- Ye line add kar

orders_bp = Blueprint("orders", __name__, url_prefix="/api/orders")

@orders_bp.route("/create", methods=["POST"])
@jwt_required()
def create_order():
    try:
        email = get_jwt_identity()  # User ki email
        data = request.get_json()

        session_id = data.get("session_id")
        address = data.get("address")
        raw_items = data.get("items")  # Frontend se aayi list
        total = data.get("total")

        if not session_id:
            return jsonify({"error": "No session ID provided"}), 400

        # --- 🛡️ STEP 1: Process Items & Add seller_email ---
# --- 🛡️ SAFE INJECTOR: Payment nahi rukegi ab ---
        processed_items = []
        for item in raw_items:
            try:
                # 1. Get ID safely
                p_id = item.get('productId') or item.get('id') or item.get('_id')
                
                product_doc = None
                # 2. Only query if p_id is a valid 24-char hex string (MongoDB format)
                if p_id and len(str(p_id)) == 24:
                    product_doc = mongo.db.products.find_one({"_id": ObjectId(p_id)})
                
                if product_doc:
                    # DB se fresh data lo including seller_email
                    item_data = {
                        "productId": str(product_doc["_id"]),
                        "name": product_doc.get("name"),
                        "price": product_doc.get("finalPrice", item.get("price")),
                        "quantity": item.get("quantity", 1),
                        "image": product_doc.get("imageURL") or item.get("image"),
                        "seller_email": product_doc.get("seller_email") # <--- Ye line main hai
                    }
                    processed_items.append(item_data)
                else:
                    # Agar product nahi mila, toh crash mat karo, jo frontend se aaya wahi bhej do
                    processed_items.append(item)
                    
            except Exception as e:
                # Agar kisi ek item mein error aaye toh baaki order kharab na ho
                print(f"Item processing skip: {e}")
                processed_items.append(item)
        # -----------------------------------------------------
        # -----------------------------------------------------

        # --- 💳 STEP 2: Stripe Payment Intent Fetch ---
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        session = stripe.checkout.Session.retrieve(session_id)
        payment_id = session.payment_intent 

        # Duplicate order check
        existing_order = mongo.db.orders.find_one({"payment_id": payment_id})
        if existing_order:
            return jsonify({"message": "Order already recorded", "order_id": str(existing_order["_id"])}), 200

        # --- 👤 STEP 3: User Info for Profile & Budget ---
        user_info = mongo.db.users.find_one({"email": email})
        if not user_info:
            return jsonify({"error": "User not found"}), 404
        
        actual_user_id = user_info["_id"]

        # --- 📝 STEP 4: Save Order to DB ---
        result = Order.create_order(
            email=email,
            items=processed_items, # <--- Injected with seller_email
            total=float(total),
            address_details=address,
            payment_id=payment_id,
            created_at=datetime.utcnow()
        )
        # ======================================================
        # ✅ CHECK: MAIL BHEJNE KA SYSTEM WITH LOGS
        # ======================================================
        if result.inserted_id:
            print(f"--- Attempting to send email to: {email} ---")
            try:
                # Pehle product ka naam nikaalna
                p_name = items[0].get("name", "Exclusive Item") if items else "Order"
                
                # Email bhejne ki koshish
                mail_status = send_order_email(email, p_name, total)
                
                if mail_status:
                    print(f"🚀 SUCCESS: Email successfully sent to {email}")
                else:
                    print(f"⚠️ WARNING: send_order_email returned False")

            except Exception as mail_err:
                # Agar App Password galat hai ya net nahi hai toh yahan pakda jayega
                print(f"❌ MAIL ERROR: Kuch toh gadbad hai! Details: {str(mail_err)}")
        # ======================================================

        # --- 🏠 STEP 5: Update User Contact/Address ---
        User.save_contact_and_address(
            email=email,
            contact={
                "email": address.get("email"),
                "phone": address.get("phone")
            },
            address=address
        )

        # --- 💰 STEP 6: Budget Update & Cart Clearing (Tera Main Logic) ---
        mongo.db.carts.update_one(
            {"userId": actual_user_id}, 
            {
                "$inc": {"spent": float(total)}, 
                "$set": {"items": []} # Cart khaali
            }
        )

        return jsonify({
            "message": "Order saved successfully and budget updated",
            "order_id": str(result.inserted_id)
        }), 201

    except Exception as e:
        print(f"Backend Error: {str(e)}")
        return jsonify({"error": str(e)}), 500