from flask import Blueprint, request
import stripe
import os

webhook_bp = Blueprint("webhook", __name__, url_prefix="/api/webhook")

@webhook_bp.route("/stripe", methods=["POST"])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get("Stripe-Signature")

    event = stripe.Webhook.construct_event(
        payload,
        sig_header,
        os.getenv("STRIPE_WEBHOOK_SECRET")
    )

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        print("✅ PAYMENT VERIFIED:", session["id"])
        

    return "", 200