import time
from app import app  # <--- Apne main file se 'app' ko import kar
from repositories.semantic_search import semantic_search

def run_evaluation():
    # 1. Flask App Context ke bina DB connect nahi hoga
    # Isliye hum 'with app.app_context()' use kar rahe hain
    with app.app_context():
        test_cases = [
            {"query": "Cotton summer dress for women", "expected_cat": "women"},
            {"query": "Nike shoes under 5000", "expected_brand": "nike"},
            {"query": "Action figure for boys", "expected_cat": "toys"},
            {"query": "Mobile under 15000", "expected_cat": "mobiles"},
        ]

        print(f"\n{'='*50}")
        print(f"🚀 RETAILX SEARCH ACCURACY REPORT")
        print(f"{'='*50}\n")

        for test in test_cases:
            query = test["query"]
            start_time = time.time()
            
            # Ab ye error nahi dega kyunki context mil gaya hai
            results = semantic_search(query, top_k=5)
            
            latency = (time.time() - start_time) * 1000
            print(f"🔍 Query: '{query}' | Latency: {latency:.2f}ms")

            if results:
                top_name = results[0].get('name', 'Unknown')
                top_score = results[0].get('similarity_score', 0)
                print(f"✅ Top Result: {top_name} (Score: {top_score})")
            else:
                print(f"❌ No Results Found!")
            print("-" * 40)

if __name__ == "__main__":
    run_evaluation()