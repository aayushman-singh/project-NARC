import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

const uri = "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// Define the interface for the posts and followers document structure
interface InstagramPost {
    post_id: string;
    content: string;
    date: string;
}
interface Tweet {
    tweet_id: string;
    text: string;
    retweetCount: number;
    replyCount: number;
    likeCount: number;
    quoteCount: number;
    createdAt: string;
    bookmarkCount: number;
    isRetweet: boolean;
    isQuote: boolean;
    url: string;
    twitterUrl: string;
}

interface InstagramProfile {
    isUserAvailable: boolean;
    id: string;
    username: string;
    fullName: string;
    pronouns: string[];
    profilePicUrl: string;
    isPrivate: boolean;
    isVerified: boolean;
    mediaCount: number;
    followerCount: number;
    followingCount: number;
    biography: string;
    externalUrl: string;
    totalIgtvVideos: number;
    hasVideos: boolean;
    totalClipsCount: number;
    hasGuides: boolean;
    bioLinks: { title: string; url: string }[];
    isBusiness: boolean;
}

interface InstagramUserDocument extends Document {
    username: string;
    posts?: InstagramPost[];
    profile?: InstagramProfile;
}

// Function to read the file, convert to base64, and store it in MongoDB
export async function uploadScreenshotToMongo(username: string, screenshotPath: string, fieldName: string, platform: string) {
    try {
        // Connect to MongoDB
        await client.connect();
        const database = client.db(`${platform}DB`);
        const collection = database.collection(`${platform}_users`);

        // Read the screenshot file as a binary buffer
        const fileBuffer = fs.readFileSync(screenshotPath);

        // Convert the binary buffer to a Base64 string
        const base64String = fileBuffer.toString('base64');

        // Store the Base64 string in MongoDB under the specified field for the user
        await collection.updateOne(
            { username: username },  // Match document by username
            { $set: { [fieldName]: base64String } },  // Store the Base64 string in the specified field
            { upsert: true }  // Insert the document if it doesn't exist
        );

        console.log(`${fieldName} screenshot uploaded and stored in Base64 format successfully for ${username}.`);
    } catch (error) {
        console.error(`Error uploading screenshot for ${username}:`, error);
    } finally {
        // Ensure the MongoDB client is closed after the operation
        await client.close();
    }
}

export async function insertFollowers(username: string, followersData: any, platform: string) {
    try {
        await client.connect();
        const database = client.db(`${platform}DB`);
        const collection = database.collection(`${platform}_users`);

        // Insert or update the document under the username
        await collection.updateOne(
            { username: username },
            { $set: { followers: followersData } },
            { upsert: true }
        );

        console.log(`Successfully inserted following data for ${username} into ${platform}DB.`);
    } catch (error) {
        console.error(`Error inserting following data into ${platform}DB:`, error);
    } finally {
        await client.close();
    }
}

export async function insertFollowing(username: string, followingData: any, platform: string) {
    try {
        await client.connect();
        const database = client.db(`${platform}DB`);
        const collection = database.collection(`${platform}_users`);

        // Insert or update the document under the username
        await collection.updateOne(
            { username: username },
            { $set: { following: followingData } },
            { upsert: true }
        );

        console.log(`Successfully inserted following data for ${username} into ${platform}DB.`);
    } catch (error) {
        console.error(`Error inserting following data into ${platform}DB:`, error);
    } finally {
        await client.close();
    }
}

export async function insertPosts(username: string, posts: any[], platform: string): Promise<void> {
    try {
        await client.connect();
        const db = client.db(`${platform}DB`); // Platform specific database
        const collection = db.collection<InstagramUserDocument>(`${platform}_users`); // Platform specific collection

        for (const post of posts) {
            await collection.updateOne(
                { 
                    username: username, 
                    "posts.id": post.id // Match existing post by unique identifier (e.g., post ID)
                },
                { 
                    $set: { "posts.$": post } // Overwrite existing post data
                },
                { 
                    upsert: true // Insert a new document if it doesn't exist
                }
            );

            // Add post if not found and matched by ID
            await collection.updateOne(
                { 
                    username: username,
                    "posts.id": { $ne: post.id } // Check if the post ID does not exist
                },
                { 
                    $push: { posts: post } // Add the new post to the array
                },
                { 
                    upsert: true // Ensure document exists
                }
            );
        }

        console.log(`Posts successfully updated/inserted for user: ${username}`);
    } catch (error) {
        console.error(`Failed to update/insert posts for user ${username}:`, error);
    } finally {
        await client.close();
    }
}

export async function insertMessages(username: string, filePath: string, platform: string) {
    await client.connect();
    const db = client.db(`${platform}DB`);
    const collection = db.collection<InstagramUserDocument>(`${platform}_users`);

    try {
        // Correctly read the file content using the promise-based readFile with 'utf8' encoding
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        const message = { content: fileContent, timestamp: new Date() }; // Add more fields as necessary

        // Update or insert the user's messages into the 'messages' array
        await collection.updateOne(
            { username: username },
            { $push: { messages: message } },
            { upsert: true }
        );
    } catch (error) {
        console.error(`Failed to upload messages: ${error.message}`);
    }
}

export async function insertTweets(username: string, tweets: Tweet[], platform: string) {
    await client.connect();
    const db = client.db(`${platform}DB`); // Platform specific database
    const collection = db.collection<InstagramUserDocument>(`${platform}_users`); // Platform specific collection

    // Update or insert the user's posts into the 'tweets' array
    await collection.updateOne(
        { username: username }, // Find document by username
        { $push: { tweets: { $each: tweets } } }, // Append tweets to the 'tweets' array
        { upsert: true } // Insert the document if it doesn't exist
    );
}

export async function insertMeta(collectionName: string, data: any[], platform: string) {
    try {
        await client.connect();
        const db = client.db(`${platform}DB`); 
        const collection = db.collection(collectionName);
        await collection.insertMany(data);
        console.log(`Data successfully inserted into MongoDB collection: ${collectionName}`);
    } catch (error) {
        console.error(`Error inserting data into ${platform}DB:`, error);
    } finally {
        await client.close();
    }
}

export async function insertInstagramProfile(username: string, profile: InstagramProfile) {
    await client.connect();
    const db = client.db('instagramDB'); // Your database name
    const collection = db.collection<InstagramUserDocument>('instagram_users'); // Collection for all users

    // Update or insert the user's profile and posts
    await collection.updateOne(
        { username: username }, // Find document by username
        {
            $set: { profile: profile }, // Update or insert the profile information
        },
        { upsert: true } // Insert the document if it doesn't exist
    );
}
