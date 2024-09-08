import axios from 'axios';
import { MongoClient } from 'mongodb';


const endpoint = 'https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/run-sync-get-dataset-items?token=apify_api_PX0pmbuYEg3gO4cHjqIb8D8ah9MOnr2lJs5D';
const data = {
    hashtags: ["india", "potato"],
    resultsLimit: 3
};

// MongoDB setup
const uri = "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function fetchData() {
    try {
        console.log('Scraper initiated...');
        // Fetch data from the API
        const response = await axios.post(endpoint, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const items = response.data; // Adjust based on the actual data structure

        // Connect to MongoDB
        await client.connect();
        const db = client.db('instagramDB');

        // Process each hashtag
        for (const hashtag of data.hashtags) {
            const collection = db.collection(hashtag); // Use hashtag as collection name

            // Insert data into the collection
            await collection.insertMany(items);
        }

        console.log('Data successfully inserted into MongoDB');
    } catch (error) {
        console.error('Error fetching data:', error.response ? error.response.data : error.message);
    } finally {
        // Close the MongoDB connection
        await client.close();
    }
}

fetchData();

