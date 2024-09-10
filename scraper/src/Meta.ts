import express from 'express';
import axios from 'axios';
import { insertMeta } from './mongoUtils.js'; // Import the MongoDB utility function

const app = express();
const PORT = 3002; // Facebook Scraper Port

app.use(express.json());

app.post('/scrape', async (req, res) => {
    const { pageId } = req.body;
    const endpoint = `https://api.apify.com/v2/acts/apify~facebook-page-scraper/run-sync-get-dataset-items?token=apify_api_PX0pmbuYEg3gO4cHjqIb8D8ah9MOnr2lJs5D`;
    const data = {
        "count": 1,
        "proxy": {
            "useApifyProxy": true,
            "apifyProxyGroups": [
                "RESIDENTIAL"
            ]
        },
        "scrapeAdDetails": false,
        "scrapePageAds.activeStatus": "all",
        "urls": [
            {
                "url": "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=IN&q=linkedin&search_type=keyword_unordered&media_type=all"
            }
        ]
    };

    try {
        console.log('Facebook scraper initiated...');
        const response = await axios.post(endpoint, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const items = response.data;
        
        // Insert data into MongoDB
        await insertMeta(pageId, items);

        res.json({ message: 'Data successfully inserted into MongoDB' });
    } catch (error) {
        console.error('Error scraping Facebook:', error.response ? error.response.data : error.message);
        res.status(500).send('Error scraping Facebook');
    }
});

app.listen(PORT, () => {
    console.log(`Facebook scraper listening on port ${PORT}`);
});
