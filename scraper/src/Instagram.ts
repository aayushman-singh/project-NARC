// Express server file (e.g., server.ts or app.ts)
import express from 'express';
import cors from 'cors';
import { scrapeInstagramProfiles } from './Instagram/InstagramProfile.js';
import { scrapeInstagramPosts } from './Instagram/InstagramPosts.js';  // Import the new function
import { InstaScraper } from './Instagram/InstaScraper.js';
import { start } from 'repl';

const app = express();
const PORT = 3001; // Instagram Scraper Port

app.use(express.json());
app.use(cors());

app.post('/instagram', async (req, res) => {
    const { startUrls, password } = req.body;

    // Check if startUrls is undefined or not an array
    if (!startUrls || !Array.isArray(startUrls)) {
        console.error('Invalid or missing startUrls:', req.body);
        return res.status(400).json({ error: 'startUrls must be an array of usernames' });
    }

    try {
        console.log('Scraping profiles...');
        await scrapeInstagramProfiles(startUrls);  

        console.log('Scraping followers and following...');

        for (const username of startUrls) {
            await InstaScraper(username, password);
        }
        console.log('Scraping posts...');
        const result = await scrapeInstagramPosts(startUrls);
        res.json(result);
        res.status(200);
    } catch (error) {
        console.error('Error scraping Instagram:', error.message);
        res.status(500).send('Error scraping Instagram');
    }
});

app.listen(PORT, () => {
    console.log(`Instagram scraper listening on port ${PORT}`);
});