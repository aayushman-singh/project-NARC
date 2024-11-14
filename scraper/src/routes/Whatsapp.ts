import express from 'express';
import cors from 'cors';
import retry from 'async-retry'; 
import whatsappScraper from '../Helpers/Whatsapp/whatsappScraper';
const app = express();
const PORT = Number(process.env.PORT) || 3004; // Whatsapp Scraper Port

app.use(express.json());
app.use(cors());

app.post('/whatsapp', async (req, res) => {
    const { startUrls } = req.body;

    // Check if startUrls is undefined or not an array
    if (!startUrls || !Array.isArray(startUrls)) {
        console.error('Invalid or missing startUrls:', req.body);
        return res.status(400).json({ error: 'startUrls must be an array of usernames' });
    }

    try {
        console.log(`Received request to scrape ${startUrls.length} profiles`);

        // Scraping followers and following with retry logic
        for (const username of startUrls) {
            await retry(async () => {
                console.log(`Starting data scraping for username: ${username}`);
                await whatsappScraper(username);
                console.log(`Data scraping for ${username} completed`);
            }, {
                retries: 3,
                onRetry: (err, attempt) => {
                    console.log(`Retrying scraping for ${username}, attempt ${attempt} after error: ${err.message}`);
                }
            });
        }

        return res.status(200).json({ message: 'Scraping complete' });
    } catch (error: any) {
        console.error('Error scraping Whatsapp:', error.message);
        return res.status(500).json({ error: 'Error scraping Whatsapp', details: error.message });
    }
});

app.listen(PORT,'0.0.0.0', () => {
    console.log(`Whatsapp scraper listening on port ${PORT}`);
});
