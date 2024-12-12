from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
import pymongo
import requests
from io import BytesIO
import textwrap
import os


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
    
def wrap_text(text, width=80):
    """
    Wrap text to a specific width for better readability in the PDF.
    """
    return textwrap.fill(text, width)


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



def generate_pdf(instagram_users, output_file="Instagram_Users_Data.pdf"):
    """
    Generate a PDF using ReportLab from Instagram user data with user input to filter
    by username. Includes user statistics and detailed post tables.
    """


    pdf = canvas.Canvas(output_file, pagesize=letter)
    width, height = letter
    temp_files = []  # Track temporary files
    page_number = 1  # Page numbering

    selected_username = input("Enter the username to generate the report for: ")

    filtered_users = [user for user in instagram_users if user.get('profile', [{}])[0].get('username') == selected_username]

    if not filtered_users:
        print(f"No data found for username: {selected_username}")
        return

    def add_header_footer():
        """
        Add header and footer to the current page.
        """
        pdf.setFont("DejaVuSans-Bold", 10)
        pdf.drawString(50, height - 30, "National Investigation Agency")
        pdf.drawString(width - 150, height - 30, f"Page {page_number}")
        pdf.setLineWidth(0.5)
        pdf.line(50, height - 35, width - 50, height - 35)  # Top line
        pdf.line(50, 40, width - 50, 40)  # Bottom line
        pdf.setFont("DejaVuSans", 10)
        pdf.drawString(50, 30, "Generated using ReportLab")

    def draw_table(pdf, data, y_position, col_widths):
        """
        Draw a table on the PDF.
        """
        table = Table(data, colWidths=col_widths)
        table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "DejaVuSans-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ])
        )
        table.wrapOn(pdf, 50, y_position)
        table.drawOn(pdf, 50, y_position - len(data) * 20)

    for user in filtered_users:
        # Start a new page for each user
        if page_number > 1:
            pdf.showPage()
        page_number += 1
        y_position = height - 100

        pdf.setFont("DejaVuSans-Bold", 16)
        heading_text = "Culprit Instagram Report"
        heading_width = pdf.stringWidth(heading_text, "DejaVuSans-Bold", 16)
        pdf.drawString((width - heading_width) / 2, height - 50, heading_text)

        add_header_footer()

        # Extract profile data
        profile_array = user.get('profile', [])
        profile = profile_array[0] if profile_array else {}

        # Draw Summary Table
        y_position -= 20
        pdf.setFont("DejaVuSans-Bold", 12)
        pdf.drawString(50, y_position, "User Information Summary:")
        y_position -= 20

        summary_data = [
            ["Field", "Value"],
            ["Username", profile.get('username', 'N/A')],
            ["Full Name", profile.get('fullName', 'N/A')],
            ["Followers Count", str(profile.get('followersCount', 0))],
            ["Following Count", str(profile.get('followsCount', 0))],
            ["Posts Count", str(profile.get('postsCount', 0))],
            ["Verified Account", "Yes" if profile.get('isVerified', False) else "No"],
            ["Joined Recently", "Yes" if profile.get('joinedRecently', False) else "No"],
        ]
        draw_table(pdf, summary_data, y_position, [150, 300])
        y_position -= len(summary_data) * 20 + 40

        # Draw Post Tables
        posts = user.get("posts", [])
        for index, post in enumerate(posts, start=1):
            if y_position < 150:  # Check space
                pdf.showPage()
                add_header_footer()
                y_position = height - 100
                page_number += 1

            pdf.setFont("DejaVuSans-Bold", 12)
            pdf.drawString(50, y_position, f"Post #{index} Details:")
            y_position -= 20

            post_data = [
                ["Field", "Value"],
                [f"Post #{index}", "The Image Extracted From URL"],
                ["Type", post.get("type", "N/A")],
                ["Caption", wrap_text(post.get("caption", "N/A"), 50)],
                ["URL", post.get("url", "N/A")],
                ["Like Count", str(post.get("likesCount", 0))],
                ["Comment Count", str(post.get("commentsCount", 0))],
                ["Timestamp", post.get("timestamp", "N/A")],
            ]
            draw_table(pdf, post_data, y_position, [150, 300])
            y_position -= len(post_data) * 20 + 40

    pdf.save()
    cleanup_temp_files(temp_files)
    print(f"PDF saved as {output_file}")



def main():
    """
    Main function to fetch Telegram users and generate PDFs.
    """
    telegram_users = fetch_telegram_users()
    generate_pdf(telegram_users)


if __name__ == "__main__":
    main()
