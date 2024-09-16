import pymongo
import json
import csv
from bson.objectid import ObjectId
import base64
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle

# MongoDB Atlas connection
def connect_to_mongodb():
    try:
        client = pymongo.MongoClient("mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        db = client['instagramDB']
        return db
    except pymongo.errors.ConnectionError as e:
        print(f"Error connecting to MongoDB: {e}")
        return None

# Fetch timeline data from ObjectId and return decoded screenshots
def fetch_timeline_screenshots(db, timeline_ids):
    files_collection = db['instagram_user.files']
    chunks_collection = db['instagram_user.chunks']
    timeline_screenshots = []

    for timeline in timeline_ids:
        for key, timeline_id in timeline.items():
            if isinstance(timeline_id, ObjectId):
                file_doc = files_collection.find_one({"_id": timeline_id})
                if file_doc:
                    file_id = file_doc["_id"]
                    chunks = chunks_collection.find({"files_id": file_id}).sort("n", 1)
                    binary_data = b''.join([chunk['data'] for chunk in chunks])

                    screenshot_filename = f"screenshot_{str(timeline_id)}.png"
                    with open(screenshot_filename, 'wb') as screenshot_file:
                        screenshot_file.write(binary_data)

                    timeline_screenshots.append({
                        "timeline_id": str(timeline_id),
                        "screenshot_file": screenshot_filename
                    })
                else:
                    timeline_screenshots.append({
                        "timeline_id": str(timeline_id),
                        "screenshot": "Screenshot not found"
                    })
            elif isinstance(timeline_id, str):
                try:
                    decoded_data = base64.b64decode(timeline_id)
                    screenshot_filename = f"screenshot_decoded_{key}.png"
                    with open(screenshot_filename, 'wb') as screenshot_file:
                        screenshot_file.write(decoded_data)

                    timeline_screenshots.append({
                        "timeline_id": key,
                        "screenshot_file": screenshot_filename
                    })
                except Exception as e:
                    timeline_screenshots.append({
                        "timeline_id": key,
                        "screenshot": f"Invalid base64 format. Error: {e}"
                    })
            elif isinstance(timeline_id, int):
                timeline_screenshots.append({
                    "timeline_id": key,
                    "screenshot": "Cannot decode integer type. No valid image found."
                })
            else:
                timeline_screenshots.append({
                    "timeline_id": key,
                    "screenshot": "Unsupported type. Cannot process."
                })

    return timeline_screenshots

def extract_posts_profile_timeline(account, db):
    posts_data = []

    if "posts" in account:
        for post in account["posts"]:
            posts_data.append({
                "post_id": post.get("id", "Unknown"),
                "content": post.get("content", "No content available"),
                "caption": post.get("caption", "not available"),
                "likes": post.get("likesCount", 0),
                "comments": post.get("commentsCount", 0),
                "post_image": post.get("displayUrl", "none")
            })

    profile_data = {}
    if "profile" in account and isinstance(account["profile"], list) and len(account["profile"]) > 0:
        profile = account["profile"][0]
        profile_data = {
            "full_name": profile.get("fullName", "Unknown"),
            "biography": profile.get("biography", "No bio available"),
            "verified": profile.get("verified", False),
            "business_account": profile.get("isBusinessAccount", False),
            "followers": profile.get("followersCount", []),
            "following": profile.get("followsCount", []),
            "friend_list": profile.get("friend_list", "unavailable")
        }

    timeline_ids = account.get("timeline", [])
    timeline_screenshots = fetch_timeline_screenshots(db, timeline_ids)

    return posts_data, profile_data, timeline_screenshots

# New function to export data to CSV
def export_to_csv(data, filename="Instagram.csv"):
    with open(filename, mode='w', newline='', encoding='utf-8') as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(["Username", "Post ID", "Content", "Caption", "Likes", "Comments", "Full Name", "Biography", "Verified", "Business Account", "Followers", "Following", "Friend List"])
        
        for account in data["instagram"]:
            for post in account["posts"]:
                writer.writerow([
                    account.get("username", "Unknown"),
                    post.get("post_id", "Unknown"),
                    post.get("content", "No content available"),
                    post.get("caption", "not available"),
                    post.get("likes", 0),
                    post.get("comments", 0),
                    account.get("full_name", "Unknown"),
                    account.get("biography", "No bio available"),
                    account.get("verified", False),
                    account.get("business_account", False),
                    account.get("followers", []),
                    account.get("following", []),
                    account.get("friend_list", "unavailable")
                ])

# New function to export data to PDF
def export_to_pdf(data, filename="Instagram.pdf"):
    pdf = canvas.Canvas(filename, pagesize=letter)
    width, height = letter

    pdf.setFont("Helvetica", 10)
    text_object = pdf.beginText(40, height - 40)
    
    for account in data["instagram"]:
        text_object.textLine(f"Username: {account.get('username', 'Unknown')}")
        text_object.textLine(f"Full Name: {account.get('full_name', 'Unknown')}")
        text_object.textLine(f"Biography: {account.get('biography', 'No bio available')}")
        text_object.textLine(f"Verified: {account.get('verified', False)}")
        text_object.textLine(f"Business Account: {account.get('business_account', False)}")
        text_object.textLine(f"Followers: {account.get('followers', [])}")
        text_object.textLine(f"Following: {account.get('following', [])}")
        text_object.textLine(f"Friend List: {account.get('friend_list', 'unavailable')}")
        text_object.textLine("Posts:")
        
        for post in account["posts"]:
            text_object.textLine(f"    Post ID: {post.get('post_id', 'Unknown')}")
            text_object.textLine(f"    Content: {post.get('content', 'No content available')}")
            text_object.textLine(f"    Caption: {post.get('caption', 'not available')}")
            text_object.textLine(f"    Likes: {post.get('likes', 0)}")
            text_object.textLine(f"    Comments: {post.get('comments', 0)}")
            text_object.textLine("-" * 50)
        
        text_object.textLine("=" * 100)
    
    pdf.drawText(text_object)
    pdf.showPage()
    pdf.save()

# Main function updated to support CSV and PDF export
def collect_social_media_data():
    db = connect_to_mongodb()
    if db is None:
        print("Exiting due to MongoDB connection failure.")
        return

    data = fetch_data(db)

    social_media_summary = {
        "instagram": []
    }

    def process_account(account, platform_name):
        account_info = {
            "_id": str(account.get("_id", "Unknown")),
            "username": account.get("username", "Unknown"),
        }

        posts_data, profile_data, timeline_screenshots = extract_posts_profile_timeline(account, db)
        account_info["posts"] = posts_data
        account_info.update(profile_data)
        account_info["timeline_screenshots"] = timeline_screenshots

        social_media_summary[platform_name].append(account_info)

    for account in data.get("instagram", []):
        process_account(account, "instagram")

    result = {
        "Instagram": social_media_summary
    }

    with open('Instagram.json', 'w') as json_file:
        json.dump(result, json_file, indent=4)

    export_to_csv(social_media_summary)  # Export to CSV
    export_to_pdf(social_media_summary)  # Export to PDF

    return result

# Fetch data from MongoDB from Instagram
def fetch_data(db):
    try:
        instagram_data = list(db['instagram_users'].find({}))
        return {
            "instagram": instagram_data,
        }
    except Exception as e:
        print(f"Error fetching data: {e}")
        return {}

if __name__ == "__main__":
    social_media_data = collect_social_media_data()
    print("Data collected and saved to 'Instagram.json', 'Instagram.csv', and 'Instagram.pdf'")

