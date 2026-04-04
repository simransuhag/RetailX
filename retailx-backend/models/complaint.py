from extensions import mongo
from datetime import datetime
from bson import ObjectId

class Complaint:
    @staticmethod
    def create_complaint(user_id, order_id, issue_type, message):
        # Nayi complaint insert karne ke liye
        return mongo.db.complaints.insert_one({
            "user_id": user_id,          # String ya ObjectId
            "order_id": order_id,        # E.g. #RX-12345
            "issue_type": issue_type,    # E.g. "Refund", "Delivery"
            "message": message,
            "status": "Pending",         # Default status hamesha Pending
            "created_at": datetime.utcnow()
        })

    @staticmethod
    def get_all():
        # Admin Dashboard ke liye saari complaints
        complaints = list(mongo.db.complaints.find().sort("created_at", -1))
        for c in complaints:
            c['_id'] = str(c['_id'])
        return complaints

    @staticmethod
    def get_by_user(user_id):
        # Kisi specific user ki complaints (User Profile ke liye)
        complaints = list(mongo.db.complaints.find({"user_id": user_id}).sort("created_at", -1))
        for c in complaints:
            c['_id'] = str(c['_id'])
        return complaints

    @staticmethod
    def update_status(complaint_id, new_status):
        # Admin jab "Resolve" click karega tab status change hoga
        return mongo.db.complaints.update_one(
            {"_id": ObjectId(complaint_id)},
            {"$set": {"status": new_status}}
        )

    @staticmethod
    def delete_complaint(complaint_id):
        # Agar koi complaint delete karni ho
        return mongo.db.complaints.delete_one({"_id": ObjectId(complaint_id)})