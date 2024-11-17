from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = "telegramDB"
S3_BUCKET = os.getenv("S3_BUCKET")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
AWS_REGION = os.getenv("AWS_REGION")

def upload_telegram_chats_to_mongo(phone_number, chat_name, chat_logs_s3_url, media_files_s3_urls):
    """
    Uploads Telegram chat logs and media file metadata to MongoDB.

    Args:
        phone_number (str): The user's phone number.
        chat_name (str): The name of the chat.
        chat_logs_s3_url (str): S3 URL for the chat logs.
        media_files_s3_urls (list): List of S3 URLs for media files.

    Returns:
        None
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

        # Update the user document in MongoDB
        collection.update_one(
            {"username": phone_number},
            {"$addToSet": {"chats": chat_data}},
            upsert=True
        )

        print(f"Uploaded Telegram chats for {phone_number} -> {chat_name}")
    except Exception as e:
        print(f"Error uploading Telegram chats to MongoDB: {e}")
