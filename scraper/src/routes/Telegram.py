from flask import Flask, request, jsonify
from telethon import TelegramClient
import os
from flask_cors import CORS
import re
import requests
from dotenv import load_dotenv
import Helpers.Telegram.mongoUtils

load_dotenv()
API_ID=os.getenv("API_KEY")
API_HASH=os.getenv("API_HASH")
# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Telegram scraping function for all chats
async def scrape_all_chats(client, output_base_dir):
    print("Client connected!")
    result = {}
    async for dialog in client.iter_dialogs():
        chat_name = dialog.name or f"chat_{dialog.id}"
        chat_name = re.sub(r'[<>:"/\\|?*]', '_', chat_name)  # Replace invalid characters with underscores
        output_dir = os.path.join(output_base_dir, chat_name)
        os.makedirs(output_dir, exist_ok=True)

        print(f"Scraping chat: {chat_name}")
        messages = []
        media_files = []

        # Iterate over messages in the current chat
        async for message in client.iter_messages(dialog, limit=100):  # Adjust limit if needed
            if message.text:
                messages.append(f"[{message.date}] {message.sender_id}: {message.text}")
            if message.media:
                file_path = await client.download_media(message, output_dir)
                media_files.append(file_path)

        # Save messages to a log file
        chat_log_path = os.path.join(output_dir, 'chat_log.txt')
        with open(chat_log_path, 'w', encoding='utf-8') as log_file:
            log_file.write("\n".join(messages))

        result[chat_name] = {
            "messages": len(messages),
            "media_files": media_files,
            "log_path": chat_log_path,
        }

    print("Scraping all chats completed!")
    return result

@app.route('/telegram', methods=['POST'])
async def scrape_all_chats_route():
    data = request.get_json()
    startUrls = data.get('startUrls')  # Get the array of phone numbers

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

            # Start the client and run the scraping function
            await client.start(phone_number)
            result = await scrape_all_chats(client, output_base_dir)
            results[phone_number] = result

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3005)
