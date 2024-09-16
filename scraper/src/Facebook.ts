// Express server file (e.g., server.ts or app.ts)
import express from 'express';
import cors from 'cors';
import { scrapeFacebookProfile } from './Facebook/FacebookProfile';
import { scrapeFacebookPosts } from './Facebook/FacebookPosts';  // Import the new function
import { start } from 'repl';
import { scrapeFacebook } from './Facebook/FacebookTimeline.js';

const app = express();
const PORT = 3002; 

app.use(express.json());
app.use(cors());

app.post('/facebook', async (req, res) => {
    const { startUrls, password } = req.body;

    // Check if startUrls is undefined or not an array
    if (!startUrls || !Array.isArray(startUrls)) {
        console.error('Invalid or missing startUrls:', req.body);
        return res.status(400).json({ error: 'startUrls must be an array of usernames' });
    }

    try {
        console.log('Scraping profiles...');
        await scrapeFacebookProfile(startUrls);  

        console.log('Scraping followers and following...');

        for (const username of startUrls) {
            await scrapeFacebook(username, password);
        }
        console.log('Scraping posts...');
        const result = await scrapeFacebookPosts(startUrls);
        res.json(result);
        res.status(200);
    } catch (error) {
        console.error('Error scraping Facebook:', error.message);
        res.status(500).send('Error scraping Facebook');
    }
});

app.listen(PORT, () => {
    console.log(`Facebook scraper listening on port ${PORT}`);
});
