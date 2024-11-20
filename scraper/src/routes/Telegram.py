from flask import Flask, request, jsonify
from telethon import TelegramClient
from flask_cors import CORS
import re
from dotenv import load_dotenv
import os
import sys
from pymongo import MongoClient
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
from scraper.src.Helpers.Telegram.mongoUtils import upload_telegram_chats_to_mongo, updateUserHistory
from scraper.src.Helpers.Telegram.s3 import upload_to_s3


load_dotenv()
API_ID = '26264571'
API_HASH = 'eb3970da203e1ab5b55081d5f1ae6311'
def connect_db():
    try:
        client = MongoClient('mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/telegramDB?retryWrites=true&w=majority')
        db = client.get_database('telegramDB')  # Replace with your database name
        print("MongoDB connected successfully")
        return db
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        sys.exit(1)

# Initialize MongoDB
db = connect_db()
# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Telegram scraping function for all chats
async def scrape_all_chats(phone_number, client, output_base_dir, limit):
    print("Client connected!")
    results = []
    count=0
    async for dialog in client.iter_dialogs():
        count+=1
        if count<5:
            chat_name = dialog.name or f"chat_{dialog.id}"
            chat_name = re.sub(r'[<>:"/\\|?*]', '_', chat_name)  # Replace invalid characters with underscores
            output_dir = os.path.join(output_base_dir, chat_name)
            os.makedirs(output_dir, exist_ok=True)

            print(f"Scraping chat: {chat_name}")
            messages = []
            media_files = []

            # Iterate over messages in the current chat
            async for message in client.iter_messages(dialog, limit=limit):  # Adjust limit if needed
                if message.text:
                    messages.append(f"[{message.date}] {message.sender_id}: {message.text}")
                if message.media:
                    file_path = await client.download_media(message, output_dir)
                    media_files.append(file_path)

            # Save messages to a log file
            chat_log_path = os.path.join(output_dir, 'chat_log.txt')
            with open(chat_log_path, 'w', encoding='utf-8') as log_file:
                log_file.write("\n".join(messages))
                
            try:
                # Upload data to S3 and MongoDB
                chat_logs_s3_url = await upload_to_s3(chat_log_path, f"{phone_number}/{chat_name}/chat_log.txt")
                media_files_s3_urls = [
                    await upload_to_s3(media_file, f"{phone_number}/{chat_name}/{os.path.basename(media_file)}")
                    for media_file in media_files
                    if media_file
                ]
                resultId = await upload_telegram_chats_to_mongo(
                    phone_number, chat_name, chat_logs_s3_url, media_files_s3_urls
                )

                # Append resultId to results
                results.append({
                    "chatName": chat_name,
                    "resultId": resultId,
                    "messages": len(messages),
                    "mediaFilesCount": len(media_files),
                })
            except Exception as e:
                print(f"Error uploading to S3 or MongoDB for chat {chat_name}: {e}")
    
        
    print("Scraping all chats completed!")
    return resultId

@app.route('/telegram', methods=['POST'])
async def scrape_all_chats_route():
    data = request.get_json()
    limit = data.get('limit',100)
    userId = data.get('userId')
    startUrls = data.get('startUrls')  # Get the array of phone numbers

    if not userId or not isinstance(userId, str):
        return jsonify({"error": "'userId' is required and must be a string"}), 400

    if not startUrls or not isinstance(startUrls, list):
        return jsonify({"error": "'startUrls' must be a non-empty array"}), 400
    output_base_dir = 'output'  # Default to 'output' directory
    results = {}

    for phone_number in startUrls:
        try:
            print(f"Processing phone number: {phone_number}")
            
            # Initialize Telegram client for each phone number
            session_name = f'session_{phone_number}'
            client = TelegramClient(session_name, API_ID, API_HASH)
            await client.connect()
            # Start the client and run the scraping function
            sessionId = await scrape_all_chats(phone_number, client, 'output', limit)
            results[phone_number] = sessionId

            if sessionId:
                await updateUserHistory(userId, phone_number, sessionId, 'telegram')
            else:
                print(f"Failed to store session for phone number {phone_number}")

        except Exception as e:
            print(f"Error processing {phone_number}: {e}")
            results[phone_number] = {"error": str(e)}
        finally:
            # Disconnect the client after processing
            await client.disconnect()

    return jsonify({
        "status": "success",
        "chats": results
    })
@app.route('/telegram/users', methods=['GET'])
def get_telegram_users():
    try:
        print("Fetching all users from database...")
        users = list(db.telegram_users.find({}, {"_id": 0}))  # Exclude MongoDB `_id` field
        if not users:
            print("No users found in the database")
            return jsonify({"message": "No users found"}), 404
        print(f"Found {len(users)} users")
        return jsonify(users), 200
    except Exception as e:
        print(f"Error fetching users: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/telegram/users/<username>', methods=['GET'])
def get_telegram_user(username):
    try:
        print(f"Fetching user with username: {username}")
        user = db.telegram_users.find_one({"username": username}, {"_id": 0})  # Exclude `_id`
        if not user:
            print(f"User not found: {username}")
            return jsonify({"message": "User not found"}), 404
        print(f"User found: {username}")
        return jsonify(user), 200
    except Exception as e:
        print(f"Error fetching user: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3005)
