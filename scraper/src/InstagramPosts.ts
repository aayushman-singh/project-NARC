import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { insertInstagramPosts } from './mongoUtils.js'; // MongoDB utility function
import { exec } from 'child_process'; 
import { start } from 'repl';
const app = express();
const PORT = 3002; // Instagram Scraper Port

app.use(express.json());
app.use(cors());

app.post('/instagramPosts', async (req, res) => {
    const { startUrls, password } = req.body;

    // Check if startUrls is undefined or not an array
    if (!startUrls || !Array.isArray(startUrls)) {
        console.error('Invalid or missing startUrls:', req.body);
        return res.status(400).json({ error: 'startUrls must be an array of usernames' });
    }

    // Prepend Instagram URL before the username
    const fullUrls = startUrls.map((username: string) => `https://www.instagram.com/${username}/`);
    const endpoint = 'https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=apify_api_PX0pmbuYEg3gO4cHjqIb8D8ah9MOnr2lJs5D';
    const data = {
        "addParentData": false,
        "directUrls": fullUrls,
        "enhanceUserSearchWithFacebookPage": false,
        "isUserReelFeedURL": false,
        "isUserTaggedFeedURL": false,
        "resultsLimit": 3,
        "resultsType": "posts",
        "searchLimit": 1,
        "searchType": "hashtag"
    };

    try {
        console.log('Instagram scraper initiated...');

        const response = await axios.post(endpoint, data, {
            headers: { 'Content-Type': 'application/json' }
        });

        const items = response.data;
        console.log(`Scraped ${items.length} posts from ${startUrls[0]}`);

        // Insert the posts into MongoDB
        for (const username of startUrls) {
            await insertInstagramPosts(username, items);
        }
        for (const username of startUrls) {
            console.log(`Triggering Playwright scraper for ${username}...`);
            exec(`node scraper.mjs ${username} ${password}`, async (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing Playwright script for ${username}: ${error.message}`);
                    return res.status(500).send(`Error scraping Instagram for ${username}`);
                }
                if (stderr) {
                    console.error(`stderr for ${username}: ${stderr}`);
                }
                console.log(`stdout for ${username}: ${stdout}`);

            });
        }

        res.json({ message: `Posts successfully inserted into collection for ${startUrls.join(', ')}` });
    } catch (error) {
        console.error('Error scraping Instagram:', error.response ? error.response.data : error.message);
        res.status(500).send('Error scraping Instagram');
    }
});


app.listen(PORT, () => {
    console.log(`Instagram scraper listening on port ${PORT}`);
});
