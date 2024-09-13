import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// Define the interface for the posts and followers document structure
interface InstagramPost {
    post_id: string;
    content: string;
    date: string;
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


export async function insertInstagramTimeline(username: string, timelineData: any) {
    try {
        // Connect to MongoDB
        await client.connect();
        const database = client.db('instagramDB');
        const collection = database.collection('instagram_users');

        // Insert or update the document for the username
        await collection.updateOne(
            { username: username },
            { $set: { timeline: timelineData } },  // Using 'timeline' for clarity
            { upsert: true }  // If document doesn't exist, create a new one
        );

        console.log(`Successfully inserted timeline data for ${username} into instagramDB.`);
    } catch (error) {
        console.error('Error inserting timeline data into MongoDB:', error);
    } finally {
        // Ensure the client is closed after operation
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