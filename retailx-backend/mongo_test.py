from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv("MONGO_URI")

try:
    client = MongoClient(uri)
    db = client.retailx
    db.test.insert_one({"status": "connected"})
    print("✅ MongoDB connected successfully")
except Exception as e:
    print("❌ MongoDB connection failed:")
    print(e)