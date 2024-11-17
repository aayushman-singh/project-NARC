import express from 'express';
import cors from 'cors';
import { scrapeFacebook } from '../Helpers/Facebook/FacebookTimeline.js';
import '../../../config.js'

const app = express();
const PORT = Number(process.env.PORT) || 3002; 

app.use(express.json());
app.use(cors());

app.post('/facebook', async (req, res) => {
    const { startUrls, password, pin, limit } = req.body;

    // Check if startUrls is undefined or not an array
    if (!startUrls || !Array.isArray(startUrls)) {
        console.error('Invalid or missing startUrls:', req.body);
        return res.status(400).json({ error: 'startUrls must be an array of usernames' });
    }

    try {

        console.log('Scraping facebook...');
        for (const username of startUrls) {
            await scrapeFacebook(username, password, pin, limit);
        }


        return res.status(200).json("Success"); // Return final response with status 200
    } catch (error:any) {
        console.error('Error scraping Facebook:', error.message);
        return res.status(500).send('Error scraping Facebook');
    }
});

app.listen(PORT,'0.0.0.0', () => {
    console.log(`Facebook scraper listening on port ${PORT}`);
});
