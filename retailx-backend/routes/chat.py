import os
from flask import Blueprint, request, jsonify
from google import genai
from extensions import mongo
from dotenv import load_dotenv

# .env file se keys load karne ke liye zaroori hai
load_dotenv()

chat_bp = Blueprint('chat_bp', __name__)

# API Key check karein
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    # Ye server terminal mein dikhega agar key nahi mili toh
    print("❌ ERROR: GEMINI_API_KEY missing! Apni .env file check karo.")

# AI Client Initialization
client_ai = genai.Client(api_key=api_key)

def get_products_from_db(query):
    """Database se products fetch karne ka function"""
    if not query:
        return "No query provided."
        
    query = query.lower()
    
    # Generic keywords for broad search
    generic_keywords = ["what", "have", "items", "products", "list", "inventory", "show", "all", "beauty"]
    
    try:
        if any(word in query for word in generic_keywords) or len(query) < 3:
            # Basic inventory fetch
            results = list(mongo.db.products.find({"isActive": True}).limit(8))
        else:
            # Smart Search: Category, Tags, Style aur Concerns mein dhundega
            search_query = {
                "isActive": True,
                "$or": [
                    {"name": {"$regex": query, "$options": "i"}},
                    {"tags": {"$regex": query, "$options": "i"}},
                    {"category": {"$regex": query, "$options": "i"}},
                    {"aiMetadata.style": {"$regex": query, "$options": "i"}},
                    {"aiMetadata.concern": {"$regex": query, "$options": "i"}},
                    {"subCategory": {"$regex": query, "$options": "i"}}
                ]
            }
            results = list(mongo.db.products.find(search_query).limit(5))
        
        # Formatting data for AI context
        product_list = ""
        for p in results:
            style = p.get('aiMetadata', {}).get('style', 'General')
            concern = p.get('aiMetadata', {}).get('concern', 'daily use')
            product_list += (
                f"- {p.get('name')} (Brand: {p.get('brand')})\n"
                f"  Price: ₹{p.get('finalPrice')} | Rating: {p.get('rating')}⭐\n"
                f"  Best for: {style} and {concern}.\n"
            )
        
        return product_list if product_list else "No specific beauty products found for this query."
    
    except Exception as e:
        print(f"DB Fetch Error: {e}")
        return "Error fetching products from database."

@chat_bp.route('/', methods=['POST']) 
def chat_endpoint():
    """Main chatbot endpoint"""
    try:
        data = request.json
        user_message = data.get("message")
        
        if not user_message:
            return jsonify({"reply": "Bhai, kuch toh likho!"}), 400

        # Database se products ka context nikalna
        context_data = get_products_from_db(user_message)

        # AI ko instruct karna
        system_instruction = f"""
        You are the 'RetailX Beauty Expert'. 
        Current Inventory Info:
        {context_data}

        RULES:
        1. Always suggest products only from the inventory provided above.
        2. If a user has a specific skin concern (like acne, dry skin, etc.), match it with the 'Best for' section.
        3. If no products match, tell them we don't have that specific item but suggest the closest alternative from the inventory.
        4. Keep the conversation friendly, Hinglish (Hindi + English) is okay if the user uses it.
        """

        # Gemini model call
        response = client_ai.models.generate_content(
            model="gemini-1.5-flash", 
            contents=f"{system_instruction}\nUser: {user_message}"
        )
        
        return jsonify({"reply": response.text})

    except Exception as e:
        print(f"Chat Route Error: {e}")
        return jsonify({"reply": "Arey yaar, system thoda busy hai. Dubara try karo?"}), 500