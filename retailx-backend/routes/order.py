from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import mongo
from models.order_model import Order
from models.user_model import User
import os
import stripe
from datetime import datetime

orders_bp = Blueprint("orders", __name__, url_prefix="/api/orders")

@orders_bp.route("/create", methods=["POST"])
@jwt_required()
def create_order():
    try:
        email = get_jwt_identity()
        data = request.get_json()

        session_id = data.get("session_id")
        address = data.get("address")
        items = data.get("items")
        total = data.get("total")

        if not session_id:
            return jsonify({"error": "No session ID provided"}), 400

        # Initialize Stripe
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

        # Retrieve session to verify it exists and get Payment Intent ID
        session = stripe.checkout.Session.retrieve(session_id)
        payment_id = session.payment_intent 

        # Prevent duplicate orders for the same payment
        existing_order = mongo.db.orders.find_one({"payment_id": payment_id})
        if existing_order:
            return jsonify({"message": "Order already recorded", "order_id": str(existing_order["_id"])}), 200

        # Save order to DB
        result = Order.create_order(
            email=email,
            items=items,
            total=float(total),
            address_details=address,
            payment_id=payment_id,
            created_at=datetime.utcnow()
        )

        # Update user's profile with latest contact/address
        User.save_contact_and_address(
            email=email,
            contact={
                "email": address.get("email"),
                "phone": address.get("phone")
            },
            address=address
        )

        return jsonify({
            "message": "Order saved successfully",
            "order_id": str(result.inserted_id)
        }), 201

    except Exception as e:
        print(f"Backend Error: {str(e)}") # Critical for debugging
        return jsonify({"error": str(e)}), 500