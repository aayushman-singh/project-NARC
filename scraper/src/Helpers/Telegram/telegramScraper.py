from telethon import TelegramClient, sync
import os

# Replace with your Telegram API credentials


# Initialize the Telegram client
client = TelegramClient('session_name', API_ID, API_HASH)

async def scrape_chat(chat_name, output_dir):
    # Ensure the output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Connect to Telegram
    await client.start(PHONE)
    print("Client connected!")

    # Get the chat entity
    chat = await client.get_entity(chat_name)

    # Iterate over messages
    async for message in client.iter_messages(chat, limit=100):
        if message.text:
            # Save text messages
            with open(os.path.join(output_dir, 'chat_log.txt'), 'a', encoding='utf-8') as f:
                f.write(f"[{message.date}] {message.sender_id}: {message.text}\n")
            print(f"Message: {message.text}")

        if message.media:
            # Download media files
            file_path = await client.download_media(message, output_dir)
            print(f"Media downloaded: {file_path}")

    print("Scraping completed!")

# Run the scraping function
with client:
    client.loop.run_until_complete(scrape_chat('chat_name_or_id', 'output_directory'))
