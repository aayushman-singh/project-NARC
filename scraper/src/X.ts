import express from 'express';
import { scrapeX } from './X/Xtimeline';  // Adjust the path to your scraper file
import cors from 'cors';
import { XTweets } from './X/XTweets';
import { start } from 'repl';

const app = express();

app.use(cors());
app.use(express.json());
const port = 3003;

// Define a route to trigger the scraping
app.get('/x', async (req, res) => {
    const { startUrls, password } = req.body;

    // Check if startUrls is undefined or not an array
    if (!startUrls || !Array.isArray(startUrls)) {
        console.error('Invalid or missing startUrls:', req.body);
        return res.status(400).json({ error: 'startUrls must be an array of usernames' });
    }
    try {
        console.log('Starting X profile scraper...')
        for (const username of startUrls){
            await scrapeX(username, password); 
        } 
        
        res.send('Profile scraping completed successfully.');
        console.log('Starting tweets scraping..')
        await XTweets(startUrls)
        res.send('Tweets scraped successfully.');
        res.status(200);
    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).send('Scraping failed.');
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`x is running on http://localhost:${port}`);
});
