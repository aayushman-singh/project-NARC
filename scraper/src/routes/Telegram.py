from flask import Flask, request, jsonify
from telethon import TelegramClient
import asyncio
import os

# Replace with your Telegram API credentials
API_ID = '26264571'
API_HASH = 'eb3970da203e1ab5b55081d5f1ae6311'

# Initialize Flask app and Telegram client
app = Flask(__name__)
client = TelegramClient('session_name', API_ID, API_HASH)

# Telegram scraping function for all chats
async def scrape_all_chats(phone_number, output_base_dir):
    await client.start(phone_number)
    print("Client connected!")

    result = {}
    async for dialog in client.iter_dialogs():
        chat_name = dialog.name or f"chat_{dialog.id}"
        chat_name = chat_name.replace("/", "_").replace("\\", "_")  # Sanitize folder name
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

# Flask route to scrape all chats
@app.route('/telegram', methods=['POST'])
def scrape_all_chats_route():
    data = request.get_json()
    phone_number = data.get('phone_number')  # Get phone number from the request
    output_base_dir = data.get('output_dir', 'output')  # Default to 'output' directory

    if not phone_number:
        return jsonify({"error": "phone_number is required"}), 400

    # Run the scraping function asynchronously
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(scrape_all_chats(phone_number, output_base_dir))

    return jsonify({
        "status": "success",
        "chats": result
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
