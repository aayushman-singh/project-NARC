import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import fs from 'fs/promises';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { errors } from 'playwright';
import '../../../config.js';

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// Initialize S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});
// Function to upload a file to S3
export const uploadToS3 = async (filePath: string, key: string) => {
    try {
        const fileContent = await fs.readFile(filePath);

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: fileContent,
        });

        await s3.send(command);
        console.log(`Uploaded ${key} to S3`);
        return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
        console.error(`Error uploading ${key} to S3:`, error);
        throw error;
    }
};

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
        const fileBuffer = fs.readFile(screenshotPath);

        // Convert the binary buffer to a Base64 string
        const base64String = fileBuffer.toString();

        // Store the Base64 string in MongoDB under the specified field for the user
        await collection.updateOne(
            { username: username },  // Match document by username
            { 
                $set: {
                 [fieldName]: base64String 
                } 
            },  // Store the Base64 string in the specified field
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

// Modified uploadChats function
export async function uploadChats(username: string, receiverUsername: string, screenshotPaths: string[], chatLogURL: string) {
    try {
        await client.connect();
        const db = client.db('whatsappDB');
        const collection = db.collection('whatsapp_users');

        // Upload each screenshot to S3 and collect URLs
        const screenshotURLs = [];
        for (const filePath of screenshotPaths) {
            const fileName = path.basename(filePath); // Use the file name as the S3 key
            const s3Key = `${username}/${receiverUsername}/${fileName}`;
            const s3URL = await uploadToS3(filePath, s3Key);
            screenshotURLs.push(s3URL);
        }

        // Update the user document with the S3 URLs
        await collection.updateOne(
            { username },
            {
                $setOnInsert: { username }, // Creates the user document if it doesn’t exist
                $addToSet: {
                    chats: {
                        receiverUsername,
                        screenshots: screenshotURLs, // Store S3 URLs
                        chats: chatLogURL,
                    },
                },
            },
            { upsert: true }
        );

        console.log(`Screenshots uploaded to MongoDB for ${username} -> ${receiverUsername}`);
    } catch (error) {
        console.error('Error uploading screenshots to MongoDB:', error);
    } finally {
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
                { username: username },  // Match document by username
                { 
                    $push: { posts: { $each: posts } }  // Append each post in the array
                },
                { upsert: true }  // Create the document if it doesn't exist
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
        const fileContent = fs.readFile(filePath, 'utf8');
        
        const message = { content: fileContent, timestamp: new Date() }; // Add more fields as necessary

        // Update or insert the user's messages into the 'messages' array
        await collection.updateOne(
            { username: username },
            { $push: { messages: message } },
            { upsert: true }
        );
    } catch (error:any) {
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
