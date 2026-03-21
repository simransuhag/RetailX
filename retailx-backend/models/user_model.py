from extensions import mongo


class User:

    @staticmethod
    def find_by_email(email):
        return mongo.db.users.find_one({"email": email})

    @staticmethod
    def create_user(name, email, password):
        return mongo.db.users.insert_one({
            "name": name,
            "email": email,
            "password": password,
            "contact": {},
            "addresses": [],
            "preferences": [],
            "wishlist": []
        })

    @staticmethod
    def save_contact_and_address(email, contact, address):
        return mongo.db.users.update_one(
            {"email": email},
            {
                "$set": {
                    "contact": contact
                },
                "$push": {
                    "addresses": address
                }
            }
        )

    @staticmethod
    def save_preferences(email, preferences):
        return mongo.db.users.update_one(
            {"email": email},
            {
                "$set": {
                    "preferences": preferences
                }
            }
        )
    @staticmethod
    def clear_wishlist(email):
        return mongo.db.users.update_one(
            {"email": email},
            {"$set": {"wishlist": []}}
        )