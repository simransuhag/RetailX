import pandas as pd
import random
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from repositories.products_repository import get_all_products

# --- SMART TF-IDF LOGIC (Weighted Metadata) ---
def get_recommendations(product_id, top_n=6): # Default ko thoda badhaya hai
    all_products = get_all_products()
    if not all_products:
        return []

    df = pd.DataFrame(all_products)

    def clean_tags(x):
        if isinstance(x, list):
            return " ".join(x)
        return str(x) if pd.notnull(x) else ""

    # Content Mix with Weighting
    # Note: 'sub_category' use kiya hai consistently
    df['content'] = (
        df['name'].fillna('') + " " + 
        (df['category'].fillna('') + " ") * 2 + 
        (df['subCategory'].fillna('') + " ") * 3 + 
        df['description'].fillna('') + " " + 
        df['tags'].apply(clean_tags)
    )

    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['content'])
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    try:
        idx = df.index[df['id'].astype(str) == str(product_id)][0]
        sim_scores = list(enumerate(cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Jitne top_n maange hain utne hi return honge
        sim_scores = sim_scores[1:top_n+1]
        recommended_indices = [i[0] for i in sim_scores]
        
        return df.iloc[recommended_indices].to_dict('records')
    except Exception as e:
        print(f"TF-IDF Error: {e}")
        return []

# --- SMART PREFERENCE LOGIC ---
def get_preference_recommendations(user_prefs):
    all_products = get_all_products()
    if not all_products:
        return []

    if user_prefs and any(user_prefs):
        user_prefs_clean = [str(p).strip().lower() for p in user_prefs if p]
        
        # Filtering based on Category OR Sub-category
        filtered = [
            p for p in all_products 
            if str(p.get('category')).lower() in user_prefs_clean or 
               str(p.get('subCategory')).lower() in user_prefs_clean
        ]
        
        if filtered:
            random.shuffle(filtered) 
            return filtered # Poori list return kar rahe hain taaki route slice kar sake

    # Cold Start / No Match
    try:
        shuffled_all = random.sample(all_products, len(all_products))
        return shuffled_all
    except Exception: 
        return all_products