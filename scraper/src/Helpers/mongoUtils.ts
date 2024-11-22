import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import fs from 'fs/promises';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { errors } from 'playwright';
import '../../../config.js';
import User from '../../../backend/models/userModel'
import mongoose from 'mongoose';

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri as string);

// Initialize S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const updateUserHistory = async (userId, phoneNumber, resultId, platform) => {
    const client = new MongoClient(process.env.MONGO_URI as string);
    try {
        await client.connect();
        const database = client.db('test').collection('users');

        // Convert `userId` to ObjectId
        const objectId = new ObjectId(userId);

        const updateResult = await database.updateOne(
            { _id: objectId },
            {
                $addToSet: {
                    searchHistory: {
                        resultId,
                        platform,
                        identifier: phoneNumber,
                        timestamp: new Date(),
                    },
                },
            },
            { upsert: false } // Ensure the document exists or is created
        );

        if (updateResult.matchedCount > 0 || updateResult.upsertedCount > 0) {
            console.log('Updated user search history successfully.');
        } else {
            console.error('User not found.');
        }
    } catch (error) {
        console.error('Error updating user search history:', error);
        throw error;
    } finally {
        await client.close();
    }
};

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
        
        const fileName = path.basename(screenshotPath); // Use the file name as the S3 key
        const s3Key = `${username}/${fieldName}/${platform}/${fileName}`;
        const s3Url = await uploadToS3(screenshotPath, s3Key)
       
        const result = await collection.findOneAndUpdate(
            { username: username },  // Match document by username
            { 
                $set: {
                 [fieldName]: s3Url 
                } 
            },  
            { 
                upsert: true,
                returnDocument: 'after' 
             }  
            
        );

        console.log(`${fieldName} screenshot uploaded successfully for ${username}.`);
        return result.value._id;

    } catch (error) {
        console.error(`Error uploading screenshot for ${username}:`, error);
    } finally {
        // Ensure the MongoDB client is closed after the operation
        await client.close();
    }
}

// Modified uploadChats function
export async function uploadChats(username: string, receiverUsername: string, screenshotPaths: string[], chatLogURL: string, platform:string) {
    try {
        await client.connect();
        const db = client.db(`${platform}DB`);
        const collection = db.collection(`${platform}_users`);

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
    if (!posts || posts.length === 0) {
        console.log(`No posts to insert for user: ${username}`);
        return;
    }

    try {
        await client.connect();
        const db = client.db(`${platform}DB`); // Platform specific database
        const collection = db.collection<InstagramUserDocument>(`${platform}_users`); // Platform specific collection

        // Perform a single update to push all posts into the user's posts array
        const result = await collection.findOneAndUpdate(
            { username: username },  // Match document by username
            { 
                $addToSet: { posts: { $each: posts } }  // Append posts uniquely
            },
            { upsert: true, returnDocument: 'after' }  // Create the document if it doesn't exist
        );

        if (result.value) {
            console.log(`Posts successfully updated/inserted for user: ${username}`);
        } else {
            console.warn(`User document for ${username} was upserted, but no value was returned.`);
        }
    } catch (error) {
        console.error(`Failed to update/insert posts for user ${username}:`, error);
    } finally {
        await client.close();
    }
}


export async function insertMessages(username: string, filePath: string,receiverUsername:string, platform: string) {
    await client.connect();
    const db = client.db(`${platform}DB`);
    const collection = db.collection<InstagramUserDocument>(`${platform}_users`);

    try { 
        const fileName = path.basename(filePath); // Use the file name as the S3 key
      
        const s3Key =  `${username}/${receiverUsername}/${fileName}`;;
        const s3Url = uploadToS3(filePath, s3Key); 
        // Update or insert the user's messages into the 'messages' array
        await collection.updateOne(
            { username: username },
            { $push: { messages: s3Url } },
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
