from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.utils import ImageReader
import pymongo
import requests
from io import BytesIO
import textwrap
import bidi.algorithm

# MongoDB connection setup
MONGO_URI = "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"  # Replace with your MongoDB connection string
DATABASE_NAME = "twitterDB"  # Replace with your database name
COLLECTION_NAME = "twitter_users"  # Collection name in MongoDB

def fetch_twitter_users():
    """
    Connect to MongoDB and fetch all Twitter user documents from the collection.
    """
    client = pymongo.MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    twitter_users = list(collection.find())
    return twitter_users

def download_image(url):
    """
    Download an image from the given URL and return an ImageReader object for ReportLab.
    """
    try:
        response = requests.get(url)
        response.raise_for_status()
        img = ImageReader(BytesIO(response.content))
        return img
    except Exception as e:
        print(f"Failed to download image from {url}: {e}")
        return None

def wrap_text(text, width=80):
    """
    Wrap text to a specific width for better readability in the PDF.
    """
    return textwrap.fill(text, width)

def process_rtl_text(text):
    """
    Process right-to-left text for languages like Arabic or Hebrew.
    """
    return bidi.algorithm.get_display(text)

def generate_pdf(twitter_users, output_file="Twitter_Users_Data.pdf"):
    """
    Generate a PDF using ReportLab from Twitter user data.
    """
    # Register a Unicode font (e.g., DejaVu Sans)
    pdfmetrics.registerFont(TTFont("DejaVuSans", "DejaVuSans.ttf"))
    pdfmetrics.registerFont(TTFont("DejaVuSans-Bold", "DejaVuSans-Bold.ttf"))

    pdf = canvas.Canvas(output_file, pagesize=letter)
    width, height = letter
    y_position = height - 50  # Start position for content

    for user in twitter_users:
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

        # Timeline
        timeline_url = user.get("timeline", "")
        if timeline_url:
            pdf.setFont("DejaVuSans-Bold", 12)
            pdf.drawString(50, y_position, "Timeline Image:")
            img = download_image(timeline_url)
            if img:
                pdf.drawImage(img, 50, y_position - 100, width=200, height=100)
                y_position -= 120
            else:
                pdf.drawString(50, y_position, "Image unavailable")
                y_position -= 20

        # Tweets
        pdf.setFont("DejaVuSans-Bold", 12)
        pdf.drawString(50, y_position, "Tweets:")
        y_position -= 20

        tweets = user.get("tweets", [])
        if tweets:
            for tweet in tweets:
                if y_position < 100:
                    pdf.showPage()
                    y_position = height - 50

                # Render tweet text
                pdf.setFont("DejaVuSans", 12)
                full_text = tweet.get("full_text", "N/A")
                
                # Process RTL text for tweets in Arabic
                if any("\u0600" <= c <= "\u06FF" for c in full_text):
                    full_text = process_rtl_text(full_text)
                
                wrapped_text = wrap_text(full_text, width=100)
                pdf.drawString(60, y_position, wrapped_text[:500] + ("..." if len(full_text) > 500 else ""))
                y_position -= 40
        else:
            pdf.drawString(50, y_position, "  No tweets available")
            y_position -= 20

    pdf.save()
    print(f"PDF saved as {output_file}")

def main():
    """
    Main function to fetch Twitter users and generate PDFs.
    """
    twitter_users = fetch_twitter_users()
    generate_pdf(twitter_users)

if __name__ == "__main__":
    main()
