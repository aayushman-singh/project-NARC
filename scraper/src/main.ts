import { ApifyClient } from 'apify-client';
import { MongoClient } from 'mongodb';
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
app.listen(3000, () => {
    console.log('Scraper listening on port 3000');
});

// MongoDB connection setup
const mongoUri = "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const mongoClient = new MongoClient(mongoUri);
const client = new ApifyClient({ token: 'apify_api_PX0pmbuYEg3gO4cHjqIb8D8ah9MOnr2lJs5D' });

app.post('/scraper', async (req: any, res: any) => {
    const { tags } = req.body; // tags is an array of hashtags

    try {
        const taskPromises = tags.map(async (hashtag: string) => {
            const task = await client.tasks().create({
                actId: 'apify/instagram-hashtag-scraper',
                name: `hashtags-${hashtag}-${Date.now()}`,
                input: { hashtags: [hashtag], resultsLimit: 1 },
                options: { memoryMbytes: 1024 },
            });

            await client.task(task.id).call();
            return task;
        });

        // Run all tasks in parallel
        const tasks = await Promise.all(taskPromises);

        res.status(200).send(`Scraping initiated for ${tasks.length} tags`);
    } catch (error) {
        console.error('Error initiating scraping:', error);
        res.status(500).send('Failed to initiate scraping');
    }
});

// Connect to MongoDB
async function connectToDB() {
    try {
        await mongoClient.connect();
        console.log("Connected successfully to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}

// Insert data into MongoDB
async function insertDataIntoMongo(dataArray: any[]) {
    try {
        const db = mongoClient.db('instagramDB');
        const collection = db.collection('scrapedData');
        await collection.insertMany(dataArray.map(data => ({ data, timestamp: new Date() })));
        console.log("Data inserted into MongoDB");
    } catch (error) {
        console.error("Error inserting data:", error);
    }
}

// Fetch the latest task
async function getLatestTask(tasks: any) {
    return tasks.reduce((latestTask: any, currentTask: any) => {
        return new Date(currentTask.createdAt) > new Date(latestTask.createdAt)
            ? currentTask
            : latestTask;
    });
}

// Fetch tasks from Apify
async function fetchTasks() {
    try {
        const response = await client.tasks().list();
        const tasks = response.items; // Assuming 'items' contains the list of tasks
        console.log("Fetched tasks:", tasks);
        return tasks;
    } catch (error) {
        console.error("Error fetching tasks from Apify:", error);
        return [];
    }
}

// Fetch and store the latest dataset
async function fetchAndStoreLatestDataset() {
    try {
        const tasks = await fetchTasks();
        const latestTask = await getLatestTask(tasks);
        const datasetUrl = `https://api.apify.com/v2/datasets/${latestTask.id}/items?format=json`;
        const datasetResponse = await fetch(datasetUrl);
        const dataset = await datasetResponse.json();
        await insertDataIntoMongo(dataset);
        return dataset;
    } catch (error) {
        console.error("Error fetching or inserting dataset:", error);
        return null;
    }
}

// Main program
(async () => {
    await connectToDB();
    const apifyData = await fetchAndStoreLatestDataset();
    if (apifyData) {
        await insertDataIntoMongo(apifyData);
    }
    await mongoClient.close();
})();


