from datetime import datetime
import os
from pymongo import MongoClient


def updateUserHistory(user_id, phone_number, result_id, platform):
    try:
        client = MongoClient(os.getenv("MONGO_URI"))
        db = client.get_database(os.getenv("MONGO_DB"))
        users_collection = db["users"]

        users_collection.update_one(
            {"_id": user_id},
            {
                "$addToSet": {
                    "searchHistory": {
                        "resultId": result_id,
                        "platform": platform,
                        "identifier": phone_number,
                        "timestamp": datetime.datetime.utcnow()
                    }
                }
            }
        )
        print(f"Search history updated for user {user_id}")
    except Exception as e:
        print(f"Error updating user search history: {e}")
    finally:
        client.close()