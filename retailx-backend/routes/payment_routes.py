import stripe
from flask import Blueprint, request, jsonify
import os

payment_bp = Blueprint("payment", __name__, url_prefix="/api/payment")
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# @payment_bp.route("/create-payment-intent", methods=["POST"])
# def create_payment_intent():
#     try:
#         data = request.json
#         # Stripe paise (cents) mein amount leta hai, isliye * 100
#         amount = int(data["amount"]) 

#         intent = stripe.PaymentIntent.create(
#             amount=amount,
#             currency="inr",
#             automatic_payment_methods={"enabled": True},
#         )
#         # Frontend ko 'clientSecret' chahiye hota hai payment confirm karne ke liye
#         return jsonify({"clientSecret": intent.client_secret})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 400

@payment_bp.route("/create-checkout-session", methods=["POST"])
def create_checkout_session():
    data = request.json
    amount = int(data["amount"])

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="payment",
        line_items=[{
            "price_data": {
                "currency": "inr",
                "product_data": {
                    "name": "RetailX Order",
                },
                "unit_amount": amount * 100,
            },
            "quantity": 1,
        }],
        # payment_routes.py mein ye change karo:
success_url="http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}",
cancel_url="http://localhost:3000/payment-cancel",
    )

    return jsonify({"url": session.url})