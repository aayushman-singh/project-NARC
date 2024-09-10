import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { insertInstagram } from './mongoUtils.js'; // Import the MongoDB utility function

const app = express();
const PORT = 3001; // Instagram Scraper Port

app.use(express.json());
app.use(cors());
app.post('/instagram', async (req, res) => {
    const { hashtags } = req.body;
    const endpoint = 'https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/run-sync-get-dataset-items?token=apify_api_PX0pmbuYEg3gO4cHjqIb8D8ah9MOnr2lJs5D';
    const data = {
        hashtags,
        resultsLimit: 1
    };

    try {
        console.log('Instagram scraper initiated...');
        const response = await axios.post(endpoint, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const items = response.data;
        
        // Insert data into MongoDB
        for (const hashtag of hashtags) {
            await insertInstagram(hashtag, items);
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
