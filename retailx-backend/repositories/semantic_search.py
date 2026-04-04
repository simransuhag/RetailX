import re
import torch
from sentence_transformers import SentenceTransformer, util
from repositories.products_repository import get_all_products

# Load model - RetailX Standard
model = SentenceTransformer('all-MiniLM-L6-v2')

product_embeddings = None
products_cache = None

def build_embeddings():
    global product_embeddings, products_cache
    products = get_all_products()
    if not products: return

    texts = []
    for p in products:
        # Identity fields ko priority dene ke liye format:
        brand = p.get('brand', '')
        name = p.get('name', '')
        cat = p.get('category', '')
        sub_cat = p.get('subCategory', '')
        tags = " ".join(p.get('tags', []))
        
        # Structure text: AI ko context dena zaroori hai
        combined_text = f"Category: {cat} {sub_cat} | Brand: {brand} | Name: {name} | Tags: {tags}"
        texts.append(combined_text)

    product_embeddings = model.encode(texts, convert_to_tensor=True)
    products_cache = products

def extract_price_filter(query):
    # 'Mobile under 15000' -> 15000
    match = re.search(r'(?:under|below|less than|sasta|range|ke niche)\s*(?:rs|inr)?\s*(\d+)', query.lower())
    return int(match.group(1)) if match else None

def semantic_search(query, top_k=20, force_refresh=False):
    global product_embeddings, products_cache
    if product_embeddings is None or force_refresh:
        build_embeddings()

    if not products_cache: return []

    original_query = query.lower().strip()
    price_limit = extract_price_filter(original_query)
    
    # Cleaning: 'Mobile under 15000' -> 'mobile'
    clean_query = re.sub(r'(?:under|below|less than|sasta|range|ke niche)\s*(?:rs|inr)?\s*\d+', '', original_query).strip()
    # 2 letters allow kiye taaki 'M3', 'S7' jaise phone models match ho sakein
    query_tokens = set(t for t in clean_query.split() if len(t) >= 2)

    query_embedding = model.encode(clean_query, convert_to_tensor=True)
    cos_scores = util.pytorch_cos_sim(query_embedding, product_embeddings)[0]
    
    results = []
    for idx, raw_score in enumerate(cos_scores):
        product = products_cache[idx].copy()
        ai_score = float(raw_score)
        
        # Product Metadata
        name = product.get('name', '').lower()
        brand = product.get('brand', '').lower()
        category = product.get('category', '').lower()
        sub_cat = product.get('subCategory', '').lower()
        tags = [t.lower() for t in product.get('tags', [])]
        
        # 1. MATCH DETECTION
        identity_pool = set(name.split()) | set(category.split()) | set(sub_cat.split()) | set(brand.split()) | set(tags)
        overlap_count = len(query_tokens.intersection(identity_pool))
        
        # 2. HYBRID SCORING
        final_score = ai_score
        
        if overlap_count > 0:
            # Huge Boost: Agar 'mobile' likha hai aur category 'mobiles' hai
            final_score += 0.3 + (0.1 * overlap_count)
        else:
            # Irrelevant content penalty
            final_score -= 0.3

        # 3. SAFETY NET (The "No Results" Fix)
        # Agar category match ho rahi hai, toh score threshold ki chinta mat karo
        is_relevant = (final_score > 0.40) or (overlap_count > 0 and ai_score > 0.25)

        # 4. PRICE FILTER (Check key names in your DB carefully)
        # Hume pichle result mein 'finalPrice' aur 'price' dono dikhe the
        p_price = product.get('finalPrice') or product.get('price') or 0
        if price_limit and p_price > price_limit:
            continue

        if is_relevant:
            product["similarity_score"] = round(final_score, 4)
            results.append(product)

    # Sort and slice
    results = sorted(results, key=lambda x: x['similarity_score'], reverse=True)
    return results[:top_k]