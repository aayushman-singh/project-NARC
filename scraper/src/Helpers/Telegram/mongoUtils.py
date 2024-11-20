from datetime import datetime
from pymongo import MongoClient, ReturnDocument
from dotenv import load_dotenv
import os
from bson import ObjectId

load_dotenv()

AWS_ACCESS_KEY_ID = "AKIAYLOJNGB2S3DJCPHQ"
AWS_SECRET_ACCESS_KEY = "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"
AWS_REGION = "ap-south-1"
S3_BUCKET_NAME = "project-narc"
MONGO_URI = "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
MONGO_DB = "telegramDB"

async def upload_telegram_chats_to_mongo(phone_number, chat_name, chat_logs_s3_url, media_files_s3_urls):
    """
    Uploads Telegram chat logs and media file metadata to MongoDB.

    Args:
        phone_number (str): The user's phone number.
        chat_name (str): The name of the chat.
        chat_logs_s3_url (str): S3 URL for the chat logs.
        media_files_s3_urls (list): List of S3 URLs for media files.

    Returns:
        str: ObjectId of the updated or inserted user document.
    """
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client[MONGO_DB]
        collection = db["telegram_users"]

        # Prepare chat data
        chat_data = {
            "receiverUsername": chat_name,
            "logs": chat_logs_s3_url,
            "media_files": media_files_s3_urls,
        }

        # Update the user document in MongoDB and return the updated document
        result = collection.find_one_and_update(
            {"username": phone_number},
            {"$addToSet": {"chats": chat_data}},  # Add chat data to the chats array
            upsert=True,
            return_document=ReturnDocument.AFTER  # Return the updated document
        )

        if result:
            print(f"Uploaded Telegram chats for {phone_number} -> {chat_name}")
            return str(result["_id"])  # Return the ObjectId as a string
        else:
            print(f"Failed to upload Telegram chats for {phone_number} -> {chat_name}")
            return None
    except Exception as e:
        print(f"Error uploading Telegram chats to MongoDB: {e}")
        return None


async def updateUserHistory(user_id, phone_number, result_id, platform):
    try:
        client = MongoClient(MONGO_URI)
        db = client.get_database("test")
        users_collection = db["users"]  
        
        # Convert `user_id` to ObjectId
        object_id = ObjectId(user_id)
        session_id = ObjectId(result_id)
        users_collection.find_one_and_update(
            {"_id": object_id},
            {
                "$addToSet": {
                    "searchHistory": {
                        "resultId": session_id,
                        "platform": platform,
                        "identifier": phone_number,
                        "timestamp": datetime.utcnow()
                    }
                
                }
                
            },
            upsert=False
        )
        print(f"Search history updated for user {user_id}")
    except Exception as e:
        print(f"Error updating user search history: {e}")
    finally:
        client.close()