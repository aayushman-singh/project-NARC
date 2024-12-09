import pymongo
from fpdf import FPDF
import requests
from io import BytesIO
from PIL import Image
import os

# MongoDB connection setup
MONGO_URI = "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"  # Replace with your MongoDB connection string
DATABASE_NAME = "facebookDB"          # Replace with your database name
COLLECTION_NAME = "facebook_users"   # Collection name in MongoDB

def fetch_users():
    """
    Connect to MongoDB and fetch all user documents from the collection.
    """
    client = pymongo.MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    
    users = list(collection.find())
    
    for user in users:
        if "friends_list" in user and isinstance(user["friends_list"], list):
            user["friends"] = [
                {
                    "Index": friend.get("index", None),
                    "UserName": friend.get("userName", None),
                    "ProfilePicUrl": friend.get("profilePicUrl", None),
                    "ProfileUrl": friend.get("profileUrl", None),
                }
                for friend in user["friends_list"]
            ]
        else:
            user["friends"] = []  # Default to empty if no friends_list found or invalid format
    
    return users

def download_image(url):
    """
    Download an image from the given URL and return the file path to a temporary image.
    """
    try:
        response = requests.get(url)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        temp_path = f"temp_image_{url.split('/')[-1]}.jpg"
        img.save(temp_path, "JPEG")
        return temp_path
    except Exception as e:
        print(f"Failed to download image from {url}: {e}")
        return None

def generate_pdf(user_data):
    """
    Generate a PDF from the user data, embedding images for the posts.
    """
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    temp_files = []  # Track temporary files for cleanup
    
    for user in user_data:
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        
        # Username
        pdf.set_font("Arial", style="B", size=12)  # Bold for the field name
        pdf.cell(30, 10, txt="Username:", ln=False)
        pdf.set_font("Arial", style="", size=12)  # Normal text for the value
        pdf.cell(0, 10, txt=user.get('username', 'N/A'), ln=True)
        
        # Profile Picture
        pdf.set_font("Arial", style="B", size=12)
        pdf.cell(30, 10, txt="Profile Picture:", ln=True)
        
        # Posts
        pdf.set_font("Arial", style="B", size=12)  # Bold for the field name
        pdf.cell(30, 10, txt="Posts:", ln=True)
        if user.get("posts"):
            for post in user["posts"]:
                pdf.set_font("Arial", style="B", size=12)  # Bold for subfields
                pdf.cell(30, 10, txt="  Post Index:", ln=False)
                pdf.set_font("Arial", style="", size=12)
                pdf.cell(0, 10, txt=str(post.get('postIndex', 'N/A')), ln=True)
                
                # Download and embed image
                image_url = post.get('s3Url')
                if image_url:
                    image_path = download_image(image_url)
                    if image_path:
                        pdf.image(image_path, x=10, y=None, w=60)  # Adjust size as needed
                        temp_files.append(image_path)  # Add to cleanup list
                    else:
                        pdf.cell(0, 10, txt="    [Image unavailable]", ln=True)
                
                pdf.set_font("Arial", style="B", size=12)
                pdf.cell(30, 10, txt="    Timestamp:", ln=False)
                pdf.set_font("Arial", style="", size=12)
                pdf.cell(0, 10, txt=str(post.get('timestamp', 'N/A')), ln=True)
        else:
            pdf.cell(200, 10, txt="  No posts available", ln=True)
        
        # Friends List
        pdf.set_font("Arial", style="B", size=12)
        pdf.cell(30, 10, txt="Friends List:", ln=True)
        friends_list = user.get("friends", [])
        if friends_list:
            for friend in friends_list:
                pdf.set_font("Arial", style="B", size=12)
                pdf.cell(30, 10, txt="  UserName:", ln=False)
                pdf.set_font("Arial", style="", size=12)
                pdf.cell(0, 10, txt=friend.get('UserName', 'N/A'), ln=True)
        else:
            pdf.cell(200, 10, txt="  No friends available", ln=True)
    
    return pdf, temp_files

def cleanup_temp_files(temp_files):
    """
    Delete temporary files.
    """
    for file_path in temp_files:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"Deleted temporary file: {file_path}")
        except Exception as e:
            print(f"Failed to delete file {file_path}: {e}")

def main():
    """
    Main function to fetch users, generate PDFs, and clean up temporary files.
    """
    user_data = fetch_users()
    pdf, temp_files = generate_pdf(user_data)
    
    # Save the PDF
    pdf_file = "Facebook_Users_Data.pdf"
    pdf.output(pdf_file)
    print(f"PDF saved as {pdf_file}")
    
    # Clean up temporary files
    cleanup_temp_files(temp_files)

if __name__ == "__main__":
    main()
