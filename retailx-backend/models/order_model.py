from extensions import mongo
from datetime import datetime

class Order:
    @staticmethod
    def create_order(email, items, total, address_details, payment_id, created_at):
        return mongo.db.orders.insert_one({
            "email": email,
            "items": items,  # This should be a list of dictionaries
            "total": total,
            "address": address_details,
            "payment_id": payment_id,
            "status": "paid",
            "created_at": created_at
        })