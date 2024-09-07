import { ApifyClient } from 'apify-client';
import { MongoClient } from 'mongodb';
import fetch from 'node-fetch'; // Use this for API requests

// MongoDB connection setupcluster0-shard-00-02.eivmu.mongodb.net:27017
const mongoUri = "mongodb+srv://aayushman2702:Lmaoded@11@cluster0-shard-00-02.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const mongoClient = new MongoClient(mongoUri);
const client = new ApifyClient({ token: 'apify_api_PX0pmbuYEg3gO4cHjqIb8D8ah9MOnr2lJs5D' });

const animalsHashtags = ['zed', 'lioness', 'sam'];

// Multiple input schemas for one Actor can be persisted in tasks.
// Tasks are saved in the Apify platform and can be run multiple times.
const socialsTasksPromises = animalsHashtags.map((hashtag) => client.tasks().create({
    actId: 'apify/instagram-hashtag-scraper',
    name: `hashtags-${hashtag}-${Date.now()}`, // Unique name using timestamp
    input: { hashtags: [hashtag], resultsLimit: 20 },
    options: { memoryMbytes: 1024 },
}));

// Create all tasks in parallel
const createdTasks = await Promise.all(socialsTasksPromises);

console.log("Created tasks:");
console.log(createdTasks);

// Run all tasks in parallel
await Promise.all(createdTasks.map((task) => client.task(task.id).call()));
async function connectToDB() {
    try {
        await mongoClient.connect();
        console.log("Connected successfully to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}

async function insertDataIntoMongo(data: any) {
    try {
        const db = mongoClient.db('instagramDB'); // Replace with your DB name
        const collection = db.collection('scrapedData'); // Replace with your collection name

        await collection.insertOne({ data, timestamp: new Date() });
        console.log("Data inserted into MongoDB");
    } catch (error) {
        console.error("Error inserting data:", error);
    }
}

// Fetch data from the provided Apify dataset API
async function fetchDataFromApify() {
    const url = 'https://api.apify.com/v2/datasets/asqRfp8RyhU1POW0R/items?format=json';
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data from Apify:", error);
    }
}

// Main program
(async () => {
    await connectToDB();

    const apifyData = await fetchDataFromApify();
    if (apifyData) {
        await insertDataIntoMongo(apifyData);
    }

    await mongoClient.close(); // Close the MongoDB connection after operation
})();
