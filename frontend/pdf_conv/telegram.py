import os
import pymongo
import requests
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.utils import ImageReader


# MongoDB connection setup
MONGO_URI = "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "telegramDB"
COLLECTION_NAME = "telegram_users"

# Register a Unicode font (e.g., DejaVu Sans)
pdfmetrics.registerFont(TTFont("DejaVuSans", "DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DejaVuSans-Bold", "DejaVuSans-Bold.ttf"))


def download_file_temp(url, filename):
    """
    Download a file temporarily and return the file path.
    """
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        file_path = f"{filename}"
        with open(file_path, "wb") as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        return file_path
    except Exception as e:
        print(f"Failed to download file from {url}: {e}")
        return None


def cleanup_temp_files(file_paths):
    """
    Delete temporary files after processing.
    """
    for file_path in file_paths:
        try:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Failed to delete temporary file {file_path}: {e}")


def fetch_telegram_users():
    """
    Connect to MongoDB and fetch all Telegram user documents from the collection.
    """
    client = pymongo.MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    telegram_users = list(collection.find())
    return telegram_users


def generate_pdf(telegram_users, output_file="Telegram_Users_Data.pdf"):
    """
    Generate a PDF using ReportLab from Telegram user data.
    """
    pdf = canvas.Canvas(output_file, pagesize=letter)
    width, height = letter
    y_position = height - 50  # Start position for content
    temp_files = []  # Track temporary files

    for user in telegram_users:
        if y_position < 100:
            pdf.showPage()  # Add a new page if the current one is full
            y_position = height - 50

        # Set font
        pdf.setFont("DejaVuSans", 12)

        # Username
        pdf.setFont("DejaVuSans-Bold", 12)
        pdf.drawString(50, y_position, "Username:")
        pdf.setFont("DejaVuSans", 12)
        pdf.drawString(150, y_position, user.get('username', 'N/A'))
        y_position -= 20

        # Chats
        pdf.setFont("DejaVuSans-Bold", 12)
        pdf.drawString(50, y_position, "Chats:")
        y_position -= 20

        chats = user.get("chats", [])
        for chat_index, chat in enumerate(chats, start=1):
            if y_position < 100:
                pdf.showPage()
                y_position = height - 50

            pdf.setFont("DejaVuSans-Bold", 12)
            pdf.drawString(50, y_position, f"  Chat #{chat_index}:")
            y_position -= 20

            # Receiver Username
            pdf.setFont("DejaVuSans-Bold", 12)
            pdf.drawString(50, y_position, "    Receiver Username:")
            pdf.setFont("DejaVuSans", 12)
            pdf.drawString(200, y_position, chat.get('receiverUsername', 'N/A'))
            y_position -= 20

             # Logs (Download chat log image)
            # Logs (Add clickable hyperlink for .txt file)
            pdf.setFont("DejaVuSans-Bold", 12)
            pdf.drawString(50, y_position, "    Logs:")
            logs_url = chat.get("logs", None)
            if logs_url:
                pdf.setFont("DejaVuSans", 12)
                # Add a clickable hyperlink for the logs file
                pdf.drawString(200, y_position, "Open Chat Log")
                pdf.linkURL(logs_url, (200, y_position - 5, 400, y_position + 10))
            else:
                pdf.drawString(200, y_position, "[No logs available]")
            y_position -= 20

            # Media Files
            pdf.setFont("DejaVuSans-Bold", 12)
            pdf.drawString(50, y_position, "    Media Files:")
            y_position -= 20
            media_files = chat.get("media_files", [])
            for media_index, media_url in enumerate(media_files, start=1):
                if y_position < 100:
                    pdf.showPage()
                    y_position = height - 50

                temp_file = download_file_temp(media_url, f"chat_{chat_index}_media_{media_index}.jpg")
                if temp_file:
                    try:
                        pdf.drawImage(temp_file, 50, y_position - 100, width=150, height=100)
                        y_position -= 120
                        temp_files.append(temp_file)
                    except Exception as e:
                        pdf.drawString(50, y_position, f"      Media {media_index}: [Error displaying image]")
                        y_position -= 20
                else:
                    pdf.drawString(50, y_position, f"      Media {media_index}: [Image unavailable]")
                    y_position -= 20

    pdf.save()
    print(f"PDF saved as {output_file}")

    # Clean up temporary files
    cleanup_temp_files(temp_files)


def main():
    """
    Main function to fetch Telegram users and generate PDFs.
    """
    telegram_users = fetch_telegram_users()
    generate_pdf(telegram_users)


if __name__ == "__main__":
    main()
