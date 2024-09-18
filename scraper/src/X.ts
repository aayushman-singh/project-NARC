import express from 'express';
import { scrapeX } from './X/Xtimeline';  // Adjust the path to your scraper file
import cors from 'cors';
import { XTweets } from './X/XTweets';

const app = express();

app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3003; // Use Vercel's port or fallback to 3003

// Define a POST route to trigger the scraping
app.post('/', async (req, res) => {
    const { startUrls, password } = req.body;

    // Check if startUrls is undefined or not an array
    if (!startUrls || !Array.isArray(startUrls)) {
        console.error('Invalid or missing startUrls:', req.body);
        return res.status(400).json({ error: 'startUrls must be an array of usernames' });
    }
    
    try {
        console.log('Starting X profile scraper...');
        for (const username of startUrls) {
            await scrapeX(username, password); 
        }

        console.log('Profile scraping completed successfully.');
        
        console.log('Starting tweets scraping...');
        await XTweets(startUrls);

        console.log('Tweets scraping completed successfully.');
        return res.status(200).send('Scraping completed successfully.');
        
    } catch (error) {
        console.error('Error during scraping:', error);
        return res.status(500).send('Scraping failed.');
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`X scraper is running on port ${port}`);
});
