import base64
import pymongo

# Connect to MongoDB
client = pymongo.MongoClient("mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")  # Adjust the URL to your MongoDB server
db = client['instagramDB']  # Replace with your database name
collection = db['instagram_users']  # Replace with your collection name

# Fetch the document with the username 'aayushman3260'
username = 'aayushman3260'
document = collection.find_one({"username": username})

# Check if the document exists
if document:
    timeline_counter = 1  # Start with timeline_1
    while True:
        # Construct the field name dynamically
        timeline_field = f'timeline_{timeline_counter}'
        message_base64 = document.get(timeline_field, None)
        
        # If the field is not found or is empty, stop the loop
        if not message_base64:
            print(f"No more timeline fields after {timeline_counter - 1} fields.")
            break

        # Convert the base64 string to binary data
        image_data = base64.b64decode(message_base64)

        # Write the data to a PNG file
        with open(f"{username}_timeline_{timeline_counter}.png", "wb") as file:
            file.write(image_data)
        print(f"Image saved as {username}_timeline_{timeline_counter}.png")

        # Increment the counter to check the next timeline field
        timeline_counter += 1
else:
    print(f"No document found for username {username}")
