import pymongo
import json
import csv
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

# MongoDB Atlas connection
def connect_to_mongodb():
    try:
        client = pymongo.MongoClient("mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        db = client['instagramDB']
        return db
    except pymongo.errors.ConnectionError as e:
        print(f"Error connecting to MongoDB: {e}")
        return None

def extract_posts_profile(account):
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

    return posts_data, profile_data

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
            text_object.textLine(f"Post ID: {post.get('post_id', 'Unknown')}")
            text_object.textLine(f"Content: {post.get('content', 'No content available')}")
            text_object.textLine(f"Caption: {post.get('caption', 'not available')}")
            text_object.textLine(f"Likes: {post.get('likes', 0)}")
            text_object.textLine(f"Comments: {post.get('comments', 0)}")
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

        posts_data, profile_data = extract_posts_profile(account)
        account_info["posts"] = posts_data
        account_info.update(profile_data)

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
