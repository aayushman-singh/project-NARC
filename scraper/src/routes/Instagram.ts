import express from 'express';
import cors from 'cors';
import { scrapeInstagramProfiles } from '../Helpers/Instagram/InstagramProfile.js';
import { scrapeInstagramPosts } from '../Helpers/Instagram/InstagramPosts.js';
import { InstaScraper } from '../Helpers/Instagram/InstaScraper.js';
import retry from 'async-retry'; // For retry logic
import '../../../config.js'

const app = express();
const PORT = Number(process.env.PORT) || 3001; // Instagram Scraper Port

app.use(express.json());
app.use(cors());

app.post('/instagram', async (req, res) => {
    const { startUrls, password, limit } = req.body;

    // Check if startUrls is undefined or not an array
    if (!startUrls || !Array.isArray(startUrls)) {
        console.error('Invalid or missing startUrls:', req.body);
        return res.status(400).json({ error: 'startUrls must be an array of usernames' });
    }

    try {
        console.log(`Received request to scrape ${startUrls.length} profiles`);

        // Scraping profiles with retry logic
        await retry(async () => {
            console.log('Starting profile scraping...');
            await scrapeInstagramProfiles(startUrls);  
            console.log('Profile scraping completed');
        }, {
            retries: 3,
            onRetry: (err, attempt) => {
                console.log(`Retrying profile scraping, attempt ${attempt} after error: ${err.message}`);
            }
        });

        // Scraping posts with retry logic
        await retry(async () => {
            console.log('Starting post scraping...');
            await scrapeInstagramPosts(startUrls, limit);
            console.log('Post scraping completed');
        }, {
            retries: 3,
            onRetry: (err, attempt) => {
                console.log(`Retrying post scraping, attempt ${attempt} after error: ${err.message}`);
            }
        });

        // Scraping followers and following with retry logic
        for (const username of startUrls) {
            await retry(async () => {
                console.log(`Starting data scraping for username: ${username}`);
                await InstaScraper(username, password);
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
        console.error('Error scraping Instagram:', error.message);
        return res.status(500).json({ error: 'Error scraping Instagram', details: error.message });
    }
});

app.listen(PORT,'0.0.0.0', () => {
    console.log(`Instagram scraper listening on port ${PORT}`);
});
