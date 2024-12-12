from pymongo import MongoClient
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from bidi.algorithm import get_display
import arabic_reshaper

pdfmetrics.registerFont(TTFont("Amiri", "Amiri-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Amiri-Bold", "Amiri-Bold.ttf"))

def reshape_and_bidi(text):
    # Handle Arabic reshaping and BiDi for proper display
    if not text:
        return "N/A"
    reshaped_text = arabic_reshaper.reshape(text)
    bidi_text = get_display(reshaped_text)
    return bidi_text


def fetch_data_from_mongodb():
    # Connect to MongoDB Atlas
    client = MongoClient("mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    db = client["twitterDB"]
    collection = db["twitter_users"]
    
    # Fetch all documents
    data = collection.find()
    return data

def create_pdf_report(data, output_file):
    c = canvas.Canvas(output_file, pagesize=letter)
    c.setFont("Amiri", 10)  # Use Arabic-compatible font
    width, height = letter

    # Title
    c.setFont("Amiri-Bold", 16)
    c.drawString(50, height - 50, "Twitter Data Report")

    y = height - 80
    for user in data:
        username = reshape_and_bidi(user.get("username", "N/A"))
        timeline = user.get("timeline", "N/A")
        tweets = user.get("tweets", [])

        c.setFont("Amiri-Bold", 12)
        c.drawString(50, y, f"Username: {username}")
        y -= 20
        c.setFont("Amiri-Bold", 10)
        c.drawString(50, y, f"Timeline: {timeline}")
        y -= 20

        c.setFont("Amiri-Bold", 12)
        c.drawString(50, y, "Tweets:")
        y -= 20

        for tweet in tweets[:5]:  # Include up to 5 tweets per user for brevity
            full_text = reshape_and_bidi(tweet.get("full_text", "N/A"))
            created_at = tweet.get("created_at", "N/A")
            retweet_count = tweet.get("retweet_count", 0)
            favorite_count = tweet.get("favorite_count", 0)

            c.setFont("Amiri", 10)
            c.drawString(50, y, f"- {full_text[:100]}...")  # Limit tweet text to 100 chars
            y -= 15
            c.drawString(60, y, f"Created At: {created_at}, Retweets: {retweet_count}, Favorites: {favorite_count}")
            y -= 20

            if y < 50:
                c.showPage()
                y = height - 50
                c.setFont("Amiri", 10)

        y -= 30

        if y < 50:
            c.showPage()
            y = height - 50
            c.setFont("Amiri", 10)

    c.save()

def main():
    data = fetch_data_from_mongodb()
    create_pdf_report(data, "twitter_report_arabic.pdf")
    print("PDF report generated: twitter_report_arabic.pdf")

if __name__ == "__main__":
    main()