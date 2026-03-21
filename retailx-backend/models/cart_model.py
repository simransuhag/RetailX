from extensions import mongo
from datetime import datetime
from bson import ObjectId

class Cart:
    @staticmethod
    def find_by_user(user_id):
        return mongo.db.carts.find_one({"userId": ObjectId(user_id)})

    @staticmethod
    def create_cart(user_id, monthly_budget=2000):
        return mongo.db.carts.insert_one({
            "userId": ObjectId(user_id),
            "items": [],
            "monthlyBudget": monthly_budget,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        })

    @staticmethod
    def clear_cart(user_id):
        """Payment ke baad cart ko khali karne ke liye"""
        return mongo.db.carts.update_one(
            {"userId": ObjectId(user_id)},
            {
                "$set": {
                    "items": [], 
                    "updatedAt": datetime.utcnow()
                }
            }
        )

    @staticmethod
    def add_item(user_id, product_data):
        cart = Cart.find_by_user(user_id)
        if not cart:
            Cart.create_cart(user_id)
            cart = Cart.find_by_user(user_id)

        product_id = product_data.get("productId")
        price = product_data.get("price")
        quantity = product_data.get("quantity", 1)

        # Budget Check
        current_spent = sum(item["price"] * item["quantity"] for item in cart.get("items", []))
        budget_limit = cart.get("monthlyBudget", 2000)

        if current_spent + (price * quantity) > budget_limit:
            return {"error": f"Budget Full! Limit: ₹{budget_limit}"}, 400

        # Update existing or add new
        found = False
        items = cart.get("items", [])
        for item in items:
            if item["productId"] == product_id:
                item["quantity"] += quantity
                found = True
                break
        
        if not found:
            items.append({
                "productId": product_id,
                "name": product_data.get("name"),
                "price": price,
                "imageURL": product_data.get("imageURL"),
                "brand": product_data.get("brand"),
                "category": product_data.get("category"),
                "quantity": quantity
            })

        mongo.db.carts.update_one(
            {"userId": ObjectId(user_id)},
            {"$set": {"items": items, "updatedAt": datetime.utcnow()}}
        )
        return {"message": "Item added successfully"}, 200

    @staticmethod
    def remove_item(user_id, product_id):
        return mongo.db.carts.update_one(
            {"userId": ObjectId(user_id)},
            {"$pull": {"items": {"productId": product_id}}, 
             "$set": {"updatedAt": datetime.utcnow()}}
        )

    