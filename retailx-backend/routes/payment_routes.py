import stripe
from flask import Blueprint, request, jsonify
import os

payment_bp = Blueprint("payment", __name__, url_prefix="/api/payment")
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@payment_bp.route("/create-checkout-session", methods=["POST"])
def create_checkout_session():
    try:
        data = request.json
        amount = int(data["amount"])

        # .env se URL uthao, agar nahi mila toh fallback to localhost
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

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
            # Double {{ }} isliye taaki Python f-string isse confuse na ho
            success_url=f"{frontend_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/payment-cancel",
        )

        return jsonify({"url": session.url})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# import stripe
# from flask import Blueprint, request, jsonify
# import os

# payment_bp = Blueprint("payment", __name__, url_prefix="/api/payment")
# stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# @payment_bp.route("/create-checkout-session", methods=["POST"])
# def create_checkout_session():
#     data = request.json
#     amount = int(data["amount"])

#     session = stripe.checkout.Session.create(
#         payment_method_types=["card"],
#         mode="payment",
#         line_items=[{
#             "price_data": {
#                 "currency": "inr",
#                 "product_data": {
#                     "name": "RetailX Order",
#                 },
#                 "unit_amount": amount * 100,
#             },
#             "quantity": 1,
#         }],
#         success_url="http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}",
#         cancel_url="http://localhost:5173/payment-cancel",
#     )

#     return jsonify({"url": session.url})