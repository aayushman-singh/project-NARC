import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { insertInstagramProfile } from './mongoUtils.js'; // Import the MongoDB utility function

const app = express();
const PORT = 3001; // Instagram Scraper Port

app.use(express.json());
app.use(cors());

app.post('/instagramProfile', async (req, res) => {
    const { startUrls } = req.body;

    const endpoint = 'https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=apify_api_PX0pmbuYEg3gO4cHjqIb8D8ah9MOnr2lJs5D';
    const data = {
        usernames: startUrls,
    };

    try {
        console.log('Instagram scraper initiated...');

        // Make the request to the Instagram scraping endpoint
        const response = await axios.post(endpoint, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const items = response.data;
        
        // Insert data into MongoDB
        for (const username of startUrls) {
            // Assuming 'items' contains profile data in the required format
            await insertInstagramProfile(username, items); // Passing empty posts array for now
        }

        res.json({ message: 'Data successfully inserted into MongoDB' });
    } catch (error) {
        console.error('Error scraping Instagram:', error.response ? error.response.data : error.message);
        res.status(500).send('Error scraping Instagram');
    }
});

app.listen(PORT, () => {
    console.log(`Instagram scraper listening on port ${PORT}`);
});
