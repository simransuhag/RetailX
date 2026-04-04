from flask_mail import Message
from extensions import mail # Ye hum Step 4 mein banayenge
from flask import render_template

def send_order_email(user_email, product_name, price):
    try:
        msg = Message(
            subject="Order Confirmed! 🎉 | RetailX",
            sender="adminretailx01@gmail.com",
            recipients=[user_email]
        )

        # Ye hai tera Styled HTML Template
        msg.html = f"""
<div style="font-family: -apple-system, 'Helvetica Neue', sans-serif; max-width: 520px; margin: auto; background: #fafaf8; border-radius: 4px; overflow: hidden; border: 1px solid #e0ded8;">

  <div style="background: #0d0d0d; padding: 40px 40px 32px;">
    <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px;">
      <div>
        <p style="margin: 0 0 10px; font-size: 10px; letter-spacing: 0.18em; color: #059669; text-transform: uppercase;">Confirmed</p>
        <h1 style="margin: 0; font-size: 30px; font-weight: 400; color: #f5f4f0; letter-spacing: 0.04em;">RETAIL<span style="color: #059669;">X</span></h1>
      </div>
      <div style="text-align: right; padding-top: 4px;">
        <p style="margin: 0; font-size: 10px; color: #555; letter-spacing: 0.08em; text-transform: uppercase;">Order</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #888;">#RX-00847</p>
      </div>
    </div>
    <div style="border-top: 1px solid #222; padding-top: 20px; display: flex; align-items: center; gap: 8px;">
      <div style="width: 6px; height: 6px; border-radius: 50%; background: #059669;"></div>
      <p style="margin: 0; font-size: 11px; color: #666; letter-spacing: 0.06em;">Being prepared for dispatch</p>
    </div>
  </div>

  <div style="padding: 36px 40px;">
    <h2 style="margin: 0 0 10px; font-size: 24px; font-weight: 400; color: #1a1a1a; letter-spacing: 0.02em;">Thank you for your order.</h2>
    <p style="margin: 0 0 32px; font-size: 13px; color: #888; line-height: 1.8; font-weight: 300;">Your purchase is confirmed. We'll send a shipping update as soon as it's on its way.</p>

    <div style="border: 1px solid #e0ded8; overflow: hidden; margin-bottom: 20px;">
      <div style="padding: 18px 22px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <p style="margin: 0 0 5px; font-size: 10px; letter-spacing: 0.14em; color: #aaa; text-transform: uppercase;">Item</p>
          <p style="margin: 0; font-size: 17px; color: #1a1a1a;">{product_name}</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0 0 5px; font-size: 10px; letter-spacing: 0.14em; color: #aaa; text-transform: uppercase;">Price</p>
          <p style="margin: 0; font-size: 22px; font-weight: 600; color: #059669;">&#8377;{price}</p>
        </div>
      </div>
      <div style="background: #f5f4f0; padding: 12px 22px; border-top: 1px solid #e0ded8; display: flex; justify-content: space-between;">
        <p style="margin: 0; font-size: 11px; color: #999;">Qty: 1 &middot; Standard delivery</p>
        <p style="margin: 0; font-size: 11px; color: #999;">3&ndash;5 business days</p>
      </div>
    </div>

    <div style="display: flex; gap: 12px; margin-bottom: 32px;">
      <div style="flex: 1; padding: 14px 16px; background: #f5f4f0;">
        <p style="margin: 0 0 4px; font-size: 10px; color: #aaa; letter-spacing: 0.12em; text-transform: uppercase;">Total Paid</p>
        <p style="margin: 0; font-size: 14px; font-weight: 500; color: #1a1a1a;">&#8377;{price}</p>
      </div>
      <div style="flex: 1; padding: 14px 16px; background: #f5f4f0;">
        <p style="margin: 0 0 4px; font-size: 10px; color: #aaa; letter-spacing: 0.12em; text-transform: uppercase;">Payment</p>
        <p style="margin: 0; font-size: 14px; font-weight: 500; color: #1a1a1a;">Completed</p>
      </div>
    </div>

    <a href="http://localhost:5000/dashboard" style="display: block; background: #059669; color: #fff; text-align: center; padding: 15px 24px; text-decoration: none; font-size: 12px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;">
      Track Your Order &rarr;
    </a>
  </div>

  <div style="padding: 18px 40px; border-top: 1px solid #e0ded8; display: flex; justify-content: space-between; background: #f5f4f0;">
    <p style="margin: 0; font-size: 11px; color: #aaa;">Questions? <a href="mailto:support@retailx.com" style="color: #059669; text-decoration: none;">support@retailx.com</a></p>
    <p style="margin: 0; font-size: 11px; color: #aaa;">24/7 support</p>
  </div>
</div>
"""
        
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False