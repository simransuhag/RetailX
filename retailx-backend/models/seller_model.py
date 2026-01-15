from extensions import mongo, bcrypt
from datetime import datetime

class Seller:
    @staticmethod
    def find_by_email(email):
        return mongo.db.sellers.find_one({"email": email})

    @staticmethod
    def create_seller(email, password, storeName, registrationId):
        # Yahan hum saare fields initialize kar rahe hain
        seller_data = {
            "email": email,
            "password": password,
            "storeName": storeName,
            "registrationId": registrationId,
            "role": "seller",
            "businessAddress": "",      # Naya field
            "contactNumber": "",        # Naya field
            "gstin": "",               # Naya field
            "businessType": "Individual", # Default value
            "createdAt": datetime.utcnow()
        }
        return mongo.db.sellers.insert_one(seller_data)

    @staticmethod
    def verify_password(stored_password, provided_password):
        return bcrypt.check_password_hash(stored_password, provided_password)







# # from werkzeug.security import generate_password_hash, check_password_hash

# from extensions import mongo, bcrypt # Bcrypt ko import karna zaroori hai

# class Seller:
#     @staticmethod
#     def find_by_email(email):
#         return mongo.db.sellers.find_one({"email": email})

#     @staticmethod
#     def create_seller(email, hashed_password, store_name, registration_id):
#         return mongo.db.sellers.insert_one({
#             "email": email,
#             "password": hashed_password,
#             "storeName": store_name,
#             "registrationId": registration_id,
#             "role": "seller"
#         })

#     # 🔥 Ye naya method password check karega
#     @staticmethod
#     def verify_password(stored_password, provided_password):
#         # stored_password: Jo DB mein hashed hai
#         # provided_password: Jo user ne login form mein dala hai
#         return bcrypt.check_password_hash(stored_password, provided_password)