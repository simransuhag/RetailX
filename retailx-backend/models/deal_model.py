from extensions import mongo
from datetime import datetime
from bson import ObjectId

class Deal:
    @staticmethod
    def create_deal(title, discount, expiry, category="General"):
        return mongo.db.deals.insert_one({
            "title": title,
            "discount": float(discount), # Ensure number format
            "expiry": expiry, # String or ISO Date
            "category": category,
            "status": "Active",
            "created_at": datetime.utcnow()
        })

    @staticmethod
    def get_all():
        # Sabhi deals (Admin ke liye)
        deals = list(mongo.db.deals.find().sort("created_at", -1))
        for deal in deals:
            deal['_id'] = str(deal['_id']) # ObjectId ko string banaya
        return deals

    @staticmethod
    def get_active_deals():
        # Sirf active deals (Frontend/Users ke liye)
        deals = list(mongo.db.deals.find({"status": "Active"}).sort("created_at", -1))
        for deal in deals:
            deal['_id'] = str(deal['_id'])
        return deals

    @staticmethod
    def delete_deal(deal_id):
        return mongo.db.deals.delete_one({"_id": ObjectId(deal_id)})