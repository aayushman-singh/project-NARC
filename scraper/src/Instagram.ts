import express from 'express';
import cors from 'cors';
import { scrapeInstagramProfiles } from './Instagram/InstagramProfile.js';
import { scrapeInstagramPosts } from './Instagram/InstagramPosts.js';
import { InstaScraper } from './Instagram/InstaScraper.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001; // Instagram Scraper Port

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
        console.log(`Received request to scrape ${startUrls.length} profiles`);

        console.log('Scraping profiles...');
        await scrapeInstagramProfiles(startUrls);  
        console.log('Scraping posts...');
        const result = await scrapeInstagramPosts(startUrls);

        //console.log('Scraping followers and following...');
        // for (const username of startUrls) {
        //     console.log(`Scraping data for username: ${username}`);
        //     await InstaScraper(username, password);
        // }

        return res.status(200).json({ message: 'Scraping complete', data: result });
    } catch (error: any) {
        console.error('Error scraping Instagram:', error.message);
        return res.status(500).json({ error: 'Error scraping Instagram', details: error.message });
    }
});

app.listen(PORT,'0.0.0.0', () => {
    console.log(`Instagram scraper listening on port ${PORT}`);
});
