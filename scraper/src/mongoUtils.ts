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
export async function uploadScreenshotToMongo(username: string, screenshotPath: string, fieldName: string) {
    try {
        // Connect to MongoDB
        await client.connect();
        const database = client.db('instagramDB');
        const collection = database.collection('instagram_users');

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


export async function insertInstagramScreenshotReference(username: string, fieldName: string, fileId: ObjectId) {
    try {
        // Connect to MongoDB
        await client.connect();
        const database = client.db('instagramDB');
        const collection = database.collection('instagram_users');

        // Insert or update the document for the username
        await collection.updateOne(
            { username: username },
            { $set: { [fieldName]: fileId } },  // Store the ObjectId under the specified field name
            { upsert: true }  // If the document doesn't exist, create a new one
        );

        console.log(`Successfully inserted ${fieldName} screenshot reference for ${username} into MongoDB.`);
    } catch (error) {
        console.error(`Error inserting ${fieldName} reference into MongoDB:`, error);
    } finally {
        // Ensure the client is closed after the operation
        await client.close();
    }
}

export async function insertInstagramFollowers(username: any, followersData: any) {
    try {
        await client.connect();
        const database = client.db('instagramDB');
        const collection = database.collection('instagram_users');

        // Insert or update the document under the username
        await collection.updateOne(
            { username: username },
            { $set: { followers: followersData } },
            { upsert: true }
        );

        console.log(`Successfully inserted following data for ${username} into instagramDB.`);
    } catch (error) {
        console.error('Error inserting following data into MongoDB:', error);
    } finally {
        await client.close();
    }
}
export async function insertInstagramFollowing(username: any, followingData: any) {
    try {
        await client.connect();
        const database = client.db('instagramDB');
        const collection = database.collection('instagram_users');

        // Insert or update the document under the username
        await collection.updateOne(
            { username: username },
            { $set: { following: followingData } },
            { upsert: true }
        );

        console.log(`Successfully inserted following data for ${username} into instagramDB.`);
    } catch (error) {
        console.error('Error inserting following data into MongoDB:', error);
    } finally {
        await client.close();
    }
}


export async function insertInstagramPosts(username: string, posts: InstagramPost[]) {
    await client.connect();
    const db = client.db('instagramDB'); // Your database name
    const collection = db.collection<InstagramUserDocument>('instagram_users'); // Collection for all users

    // Update or insert the user's posts into the 'posts' array
    await collection.updateOne(
        { username: username }, // Find document by username
        { $push: { posts: { $each: posts } } }, // Append posts to the 'posts' array
        { upsert: true } // Insert the document if it doesn't exist
    );
}
export async function insertTweets(username: string, tweets: Tweet[]) {
    await client.connect();
    const db = client.db('XDB'); // Your database name
    const collection = db.collection<InstagramUserDocument>('x_users'); // Collection for all users

    // Update or insert the user's posts into the 'posts' array
    await collection.updateOne(
        { username: username }, // Find document by username
        { $push: { tweets: { $each: tweets } } }, // Append posts to the 'posts' array
        { upsert: true } // Insert the document if it doesn't exist
    );
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


export async function insertMeta(collectionName: string, data: any[]) {
    try {
        await client.connect();
        const db = client.db('metaDB'); 
        const collection = db.collection(collectionName);
        await collection.insertMany(data);
        console.log(`Data successfully inserted into MongoDB collection: ${collectionName}`);
    } catch (error) {
        console.error('Error inserting data into MongoDB:', error);
    } finally {
        await client.close();
    }
}