import os
import re
import json
import traceback
from flask import Blueprint, request, jsonify
from google import genai
from extensions import mongo

chat_bp = Blueprint("chat_bp", __name__)

# =========================
# Gemini AI Client
# =========================
client_ai = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# ======================================================
# SAFE JSON EXTRACTOR
# ======================================================
def extract_json_from_text(text: str):
    try:
        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            return None
        return json.loads(match.group())
    except Exception:
        return None

# ======================================================
# UPGRADED INTENT EXTRACTION
# ======================================================
def extract_intent_with_ai(user_message: str):
    intent = {"category": None, "max_price": None, "brand": None, "use_case": None}
    msg_lower = user_message.lower()

    # --- STEP A: LOCAL KEYWORDS (Isse koi AI ki zarurat nahi padegi) ---
    # Database ki categories ke hisab se yahan keywords daal do
    category_map = {
    "Toys": [
        "toy", "toys", "kids", "child", "children", "game", "doll",
        "puzzle", "board game", "playing", "action figure", "lego"
    ],

    "Footwear": [
        "shoe", "shoes", "sneaker", "sneakers", "slipper", "sandals",
        "flip flop", "boots", "footwear"
    ],

    "PetSupplies": [
        "pet", "pets", "dog", "cat", "puppy", "kitten",
        "pet food", "dog food", "cat food", "leash", "collar", "toy for pets"
    ],

    "Gaming": [
        "gaming", "game", "console", "controller", "joystick",
        "playstation", "ps5", "xbox", "pc game", "video game"
    ],

    "Beverage": [
        "drink", "drinks", "juice", "soft drink", "soda",
        "tea", "coffee", "cold drink", "beverage", "energy drink"
    ],

    "Jewellery": [
        "jewellery", "jewelry", "ring", "necklace", "chain",
        "bracelet", "earring", "bangle", "gold", "silver", "diamond"
    ],

    "Books": [
        "book", "books", "novel", "story", "magazine",
        "comic", "textbook", "study", "education", "reading"
    ],

    "Electronics": [
        "laptop", "phone", "mobile", "smartphone", "tablet",
        "tv", "television", "earbuds", "headphone", "speaker",
        "gadget", "watch", "smartwatch"
    ],

    "Fashion": [
        "shirt", "tshirt", "t-shirt", "jeans", "dress",
        "clothing", "top", "pant", "jacket", "kurta", "saree"
    ],

    "Beauty": [
        "makeup", "beauty", "lipstick", "foundation",
        "compact", "blush", "mascara"
    ],

    "Skincare": [
        "skin", "skincare", "face wash", "cream", "moisturizer",
        "serum", "sunscreen", "cleanser", "lotion"
    ],

    "Haircare": [
        "hair", "haircare", "shampoo", "conditioner",
        "hair oil", "serum", "hair mask", "hair fall"
    ]
}


    # User ke message ko tod kar keywords se match karo
    words_in_message = msg_lower.split()
    for cat, keywords in category_map.items():
        # Agar koi bhi keyword message mein mil jaye
        if any(kw in msg_lower for kw in keywords):
            intent["category"] = cat
            break

    # Price logic
    price_match = re.search(r"(under|below|max|upto|up to|budget)\s*₹?\s*(\d+)", msg_lower)
    if price_match:
        intent["max_price"] = int(price_match.group(2))

    # --- STEP B: AI ENHANCEMENT (Sirf tab chalega jab quota ho) ---
    try:
        prompt = f"Extract shopping intent: category, brand, price from '{user_message}'. Return JSON."
        response = client_ai.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        ai_intent = extract_json_from_text(response.text)
        if ai_intent:
            for key in intent:
                if ai_intent.get(key) and intent[key] is None: # Sirf tab update karo agar local ne nahi dhunda
                    intent[key] = ai_intent[key]
    except Exception:
        print(f"DEBUG: AI failed, using Local Intent: {intent}")

    return intent

# def extract_intent_with_ai(user_message: str):
#     intent = {
#         "category": None,
#         "max_price": None,
#         "brand": None,
#         "use_case": None
#     }

#     # RULE BASED PRICE (Fast & Reliable)
#     price_match = re.search(
#         r"(under|below|max|upto|up to|budget)\s*₹?\s*(\d+)",
#         user_message.lower()
#     )
#     if price_match:
#         intent["max_price"] = int(price_match.group(2))

#     # AI ENHANCEMENT (Multi-Category Support)
#     try:
#         prompt = f"""
#         Analyze this shopping query: "{user_message}"
#         Identify:
#         1. category (e.g., electronics, footwear, beauty, etc.)
#         2. max_price (numeric only)
#         3. brand
#         4. use_case (e.g., gaming, wedding, office)

#         Return ONLY a clean JSON object. If a field is unknown, use null.
#         """

#         response = client_ai.models.generate_content(
#             model="gemini-2.0-flash", # Updated to stable version
#             contents=prompt
#         )

#         ai_intent = extract_json_from_text(response.text)

#         if ai_intent:
#             for key in intent:
#                 # Sirf tab update karein agar AI ne value di ho aur rule-based ne pehle na dhunda ho
#                 if ai_intent.get(key) is not None:
#                     intent[key] = ai_intent[key]

#     except Exception as e:
#         print("Intent AI Error:", e)

#     return intent

# ======================================================
# DATABASE QUERY
# ======================================================
# def get_products_from_db(intent: dict):
#     try:
#         query = {"isActive": True}

#         if intent.get("category"):
#             query["category"] = {"$regex": intent["category"], "$options": "i"}

#         if intent.get("brand"):
#             query["brand"] = {"$regex": intent["brand"], "$options": "i"}

#         if intent.get("max_price"):
#             query["finalPrice"] = {"$lte": int(intent["max_price"])}

#         results = list(mongo.db.products.find(query).limit(5))

#         if not results:
#             return None # Khali inventory return karein

#         context = ""
#         for p in results:
#             context += (
#                 f"- **{p.get('name')}** | Brand: {p.get('brand')}\n"
#                 f"  Price: ₹{p.get('finalPrice')} | Rating: {p.get('rating')}⭐\n"
#                 f"  Highlight: {p.get('aiMetadata', {}).get('use', 'Premium Quality')}\n\n"
#             )
#         return context

#     except Exception as e:
#         print("DB Fetch Error:", e)
#         return "Error fetching product data."

def get_products_from_db(intent: dict):
    try:
        # AGAR INTENT KHALI HAI (category is None)
        if not intent.get("category"):
            print("DEBUG: Category not identified. Skipping DB search.")
            return None

        query = {
            "isActive": True,
            "$or": [
                {"category": {"$regex": intent["category"], "$options": "i"}},
                {"name": {"$regex": intent["category"], "$options": "i"}}
            ]
        }

        if intent.get("max_price"):
            query["finalPrice"] = {"$lte": int(intent["max_price"])}

        print(f"DEBUG: Running MongoDB Query -> {query}")
        results = list(mongo.db.products.find(query).limit(5))
        
        if not results:
            return None

        context = ""
        for p in results:
            context += f"- **{p.get('name')}** (₹{p.get('finalPrice')}) | Cat: {p.get('category')}\n\n"
        return context

    except Exception as e:
        print(f"DB Error: {e}")
        return None

# ======================================================
# CHAT ENDPOINT
# ======================================================
@chat_bp.route("/", methods=["POST", "OPTIONS"])
def chat_endpoint():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({"reply": "Invalid request"}), 400

        user_message = data["message"].strip()

        # 1. Intent Nikalna (Isme humne keyword fallback dala hua hai)
        intent = extract_intent_with_ai(user_message)

        # 2. Database se dhoondhna
        context_data = get_products_from_db(intent)

        # 3. Final Response Logic
        # Agar AI Quota khatam hai, toh hum manual response bhejenge
        try:
            system_instruction = "You are a shopping assistant..."
            final_prompt = f"{system_instruction}\nContext: {context_data}\nUser: {user_message}"
            
            response = client_ai.models.generate_content(
                model="gemini-2.0-flash", # Ya jo bhi model tu use kar raha hai
                contents=final_prompt
            )
            reply = response.text
        except Exception as ai_err:
            print(f"Final AI Response Failed: {ai_err}")
            # AGAR AI FAIL HUA, TOH DIRECT DB DATA BHEJO
            if context_data:
                reply = f"Mujhe aapke liye kuch products mile hain:\n\n{context_data}"
            else:
                reply = "I'm sorry, humare paas abhi ye stock mein nahi hai. Kya aap kuch aur dekhna chahenge?"

        return jsonify({"reply": reply})

    except Exception:
        traceback.print_exc()
        return jsonify({"reply": "Technical issue ki wajah se main connect nahi kar pa raha hoon."}), 500
