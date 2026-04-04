from extensions import mongo
from datetime import datetime
from bson import ObjectId

class Cart:
    @staticmethod
    def find_by_user(user_id):
        return mongo.db.carts.find_one({"userId": ObjectId(user_id)})

    @staticmethod
    def create_cart(user_id, monthly_budget=None):
        # Default budget ko None rakha hai taaki user ki marzi ho
        return mongo.db.carts.insert_one({
            "userId": ObjectId(user_id),
            "items": [],
            "monthlyBudget": monthly_budget,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        })

    @staticmethod
    def clear_cart(user_id):
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
        price = product_data.get("price", 0)
        quantity = product_data.get("quantity", 1)

        # --- BUDGET CHECK LOGIC ---
        budget_limit = cart.get("monthlyBudget")
        if budget_limit is not None:  # Check sirf tabhi hoga jab budget set ho
            current_spent = sum(item["price"] * item.get("quantity", 1) for item in cart.get("items", []))
            if current_spent + (price * quantity) > budget_limit:
                return {"error": f"Budget Exceeded! Limit: ₹{budget_limit}"}, 400

        # Update existing or add new
        items = cart.get("items", [])
        found = False
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
                "imageURL": product_data.get("imageURL") or product_data.get("image"),
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

    @staticmethod
    def update_budget(user_id, monthly_budget):
        # monthly_budget can be None or a number
        return mongo.db.carts.update_one(
            {"userId": ObjectId(user_id)},
            {"$set": {"monthlyBudget": monthly_budget, "updatedAt": datetime.utcnow()}}
        )

    @staticmethod
    def calculate_spent(cart):
        if not cart: 
            return {"spent": 0, "remaining": None, "percentUsed": 0, "monthlyBudget": None}
        
        budget = cart.get("monthlyBudget")
        # FIX: Items se total spent nikalna hoga
        budget = cart.get("monthlyBudget")
        spent =cart.get("spent", 0) 
        
        result = {
            "spent": spent,
            "monthlyBudget": budget,
            "remaining": None,
            "percentUsed": 0
        }

        if budget and budget > 0:
            result["remaining"] =  budget - spent # Taaki negative na ho
            result["percentUsed"] = round((spent / budget * 100), 2)
        
        return result