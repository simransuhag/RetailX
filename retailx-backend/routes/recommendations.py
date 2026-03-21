from flask import Blueprint, request, jsonify
from repositories.recommendation_repository import get_recommendations, get_preference_recommendations
import random
from repositories.products_repository import get_all_products

recommendation_bp = Blueprint('recommendations', __name__)


@recommendation_bp.route('/feed', methods=['GET'])
def get_home_feed():
    prefs_raw = request.args.get('prefs', '')
    last_viewed = request.args.get('last_viewed')
    user_prefs = [p.strip().lower() for p in prefs_raw.split(',') if p]

    # Data Buckets initialization
    response_data = {
        "mind_reader": [],       # Based on Last Viewed (TF-IDF)
        "signature_styles": [],   # Based on User Preferences
        "synergy_picks": [],      # Complementary items
        "discovery_radar": []     # Random/Trending
    }

    exclude_ids = set() # Duplicates handle karne ke liye

    # --- SECTION 1: MIND READER ---
    if last_viewed and last_viewed != "null":
        # Similarity based products
        sim_products = get_recommendations(last_viewed, top_n=6)
        response_data["mind_reader"] = sim_products
        for p in sim_products: exclude_ids.add(p['id'])

    # --- SECTION 2: SIGNATURE STYLES ---
    pref_products = get_preference_recommendations(user_prefs)
    # Sirf wahi jo Mind Reader mein nahi hain
    filtered_prefs = [p for p in pref_products if p['id'] not in exclude_ids]
    random.shuffle(filtered_prefs)
    response_data["signature_styles"] = filtered_prefs[:8]
    for p in response_data["signature_styles"]: exclude_ids.add(p['id'])

    # --- SECTION 3: DISCOVERY RADAR ---
    all_prods = get_all_products()
    remaining = [p for p in all_prods if p['id'] not in exclude_ids]
    if remaining:
        response_data["discovery_radar"] = random.sample(remaining, min(len(remaining), 10))

    return jsonify(response_data), 200




# 2. Individual Product Page ke liye (TF-IDF trigger)
@recommendation_bp.route('/api/recommendations/similar/<product_id>', methods=['GET'])
def get_similar_items(product_id):
    similar_products = get_recommendations(product_id)
    return jsonify(similar_products), 200