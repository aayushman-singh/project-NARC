from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.utils import ImageReader
import pymongo
import requests
from io import BytesIO
import textwrap
import os

# MongoDB connection setup
MONGO_URI = "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "instagramDB"
COLLECTION_NAME = "instagram_users"

# Register a Unicode font for ReportLab
pdfmetrics.registerFont(TTFont("DejaVuSans", "DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DejaVuSans-Bold", "DejaVuSans-Bold.ttf"))

def download_image_temp(url, filename):
    """
    Download an image temporarily to a file and return the file path.
    """
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        file_path = f"{filename}.png"
        with open(file_path, "wb") as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        return file_path
    except Exception as e:
        print(f"Failed to download image from {url}: {e}")
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

def fetch_instagram_users():
    """
    Connect to MongoDB and fetch all Instagram user documents from the collection.
    """
    client = pymongo.MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    instagram_users = list(collection.find())
    return instagram_users


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


def generate_pdf(instagram_users, output_file="Instagram_Users_Data.pdf"):
    """
    Generate a PDF using ReportLab from Instagram user data.
    """
    pdf = canvas.Canvas(output_file, pagesize=letter)
    width, height = letter
    y_position = height - 50  # Start position for content
    temp_files = []  # Track temporary files

    for user in instagram_users:
        if y_position < 100:
            pdf.showPage()  # Add a new page if the current one is full
            y_position = height - 50

        # Extract profile data from the first element of the profile array
        profile_array = user.get('profile', [])
        profile = profile_array[0] if profile_array else {}

        # Set font
        pdf.setFont("DejaVuSans", 12)

        # Username and Full Name
        pdf.setFont("DejaVuSans-Bold", 12)
        pdf.drawString(50, y_position, "Username:")
        pdf.setFont("DejaVuSans", 12)
        pdf.drawString(150, y_position, profile.get('username', 'N/A'))
        y_position -= 20

        pdf.setFont("DejaVuSans-Bold", 12)
        pdf.drawString(50, y_position, "Full Name:")
        pdf.setFont("DejaVuSans", 12)
        pdf.drawString(150, y_position, profile.get('fullName', 'N/A'))
        y_position -= 20

        # Biography
        pdf.setFont("DejaVuSans-Bold", 12)
        pdf.drawString(50, y_position, "Biography:")
        pdf.setFont("DejaVuSans", 12)
        wrapped_biography = wrap_text(profile.get('biography', 'No biography provided'), width=80)
        pdf.drawString(150, y_position, wrapped_biography)
        y_position -= 40

        # Profile Image
        profile_pic_url = profile.get('profilePicUrl', "")
        if profile_pic_url:
            img = download_image(profile_pic_url)
            if img:
                pdf.drawImage(img, 50, y_position - 100, width=100, height=100)
                y_position -= 120
            else:
                pdf.drawString(50, y_position, "Profile Image: [Image unavailable]")
                y_position -= 20

        # Stats: Followers, Following, Posts
        pdf.setFont("DejaVuSans-Bold", 12)
        pdf.drawString(50, y_position, "Followers Count:")
        pdf.setFont("DejaVuSans", 12)
        pdf.drawString(150, y_position, str(profile.get('followersCount', 0)))
        y_position -= 20

        pdf.setFont("DejaVuSans-Bold", 12)
        pdf.drawString(50, y_position, "Following Count:")
        pdf.setFont("DejaVuSans", 12)
        pdf.drawString(150, y_position, str(profile.get('followsCount', 0)))
        y_position -= 20

        pdf.setFont("DejaVuSans-Bold", 12)
        pdf.drawString(50, y_position, "Posts Count:")
        pdf.setFont("DejaVuSans", 12)
        pdf.drawString(150, y_position, str(profile.get('postsCount', 0)))
        y_position -= 20

        # Is Verified and Recently Joined
        pdf.setFont("DejaVuSans-Bold", 12)
        pdf.drawString(50, y_position, "Verified Account:")
        pdf.setFont("DejaVuSans", 12)
        pdf.drawString(150, y_position, "Yes" if profile.get('isVerified', False) else "No")
        y_position -= 20

        pdf.setFont("DejaVuSans-Bold", 12)
        pdf.drawString(50, y_position, "Joined Recently:")
        pdf.setFont("DejaVuSans", 12)
        pdf.drawString(150, y_position, "Yes" if profile.get('joinedRecently', False) else "No")
        y_position -= 20

        # Timeline Images
        pdf.setFont("DejaVuSans-Bold", 12)
        pdf.drawString(50, y_position, "Timeline Images:")
        y_position -= 20
        timeline_images = [
            user.get('time_line_1'),
            user.get('time_line_2'),
            user.get('time_line_3'),
        ]
        for idx, timeline_url in enumerate(timeline_images, start=1):
            if timeline_url:
                temp_file = download_image_temp(timeline_url, f"timeline_{idx}")
                if temp_file:
                    pdf.drawImage(temp_file, 50, y_position - 100, width=150, height=100)
                    y_position -= 120
                    temp_files.append(temp_file)
                else:
                    pdf.drawString(50, y_position, f"Timeline {idx}: [Image unavailable]")
                    y_position -= 20


        # Posts
        pdf.setFont("DejaVuSans-Bold", 12)
        pdf.drawString(50, y_position, "Posts:")
        y_position -= 20
        posts = user.get("posts", [])
        for index, post in enumerate(posts, start=1):
            if y_position < 100:
                pdf.showPage()
                y_position = height - 50

            pdf.setFont("DejaVuSans-Bold", 12)
            pdf.drawString(50, y_position, f"  Post #{index}:")
            y_position -= 20

            pdf.setFont("DejaVuSans", 12)
            # Include post-specific details
            pdf.drawString(50, y_position, f"    Post ID: {post.get('postId', 'N/A')}")
            y_position -= 20
            pdf.drawString(50, y_position, f"    Type: {post.get('type', 'N/A')}")
            y_position -= 20
            pdf.drawString(50, y_position, f"    Caption: {wrap_text(post.get('caption', 'N/A'), width=60)}")
            y_position -= 40
            pdf.drawString(50, y_position, f"    Comments Count: {post.get('commentsCount', 0)}")
            y_position -= 20
            pdf.drawString(50, y_position, f"    Likes Count: {post.get('likesCount', 0)}")
            y_position -= 20
            pdf.drawString(50, y_position, f"    Timestamp: {post.get('timestamp', 'N/A')}")
            y_position -= 20

            # Media
            media_url = post.get("mediaUrl", "")
            if media_url:
                img = download_image(media_url)
                if img:
                    pdf.drawImage(img, 50, y_position - 100, width=200, height=100)
                    y_position -= 120
                else:
                    pdf.drawString(50, y_position, "    Media: [Image unavailable]")
                    y_position -= 20
            else:
                pdf.drawString(50, y_position, "    Media: [No media available]")
                y_position -= 20


        # Followers
        pdf.setFont("DejaVuSans-Bold", 12)
        pdf.drawString(50, y_position, "Followers:")
        y_position -= 20
        followers = user.get("followers", [])
        for follower in followers:
            if y_position < 100:
                pdf.showPage()
                y_position = height - 50
            pdf.setFont("DejaVuSans", 12)
            pdf.drawString(50, y_position, f"  {follower.get('username', 'N/A')}")
            y_position -= 20

        # Following
        pdf.setFont("DejaVuSans-Bold", 12)
        pdf.drawString(50, y_position, "Following:")
        y_position -= 20
        following = user.get("following", [])
        for follow in following:
            if y_position < 100:
                pdf.showPage()
                y_position = height - 50
            pdf.setFont("DejaVuSans", 12)
            pdf.drawString(50, y_position, f"  {follow.get('username', 'N/A')}")
            y_position -= 20         
            

    pdf.save()
    print(f"PDF saved as {output_file}")



def main():
    """
    Main function to fetch Instagram users and generate PDFs.
    """
    instagram_users = fetch_instagram_users()
    generate_pdf(instagram_users)


if __name__ == "__main__":
    main()
