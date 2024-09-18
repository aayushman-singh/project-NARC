import axios from 'axios';
import { insertInstagramProfile } from '../../mongoUtils';  // Assuming this is your MongoDB utility function

// Exported async function
export async function scrapeInstagramProfiles(startUrls: string[]) {
    const endpoint = 'https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=apify_api_PX0pmbuYEg3gO4cHjqIb8D8ah9MOnr2lJs5D';
    const data = {
        usernames: startUrls,
    };

    try {
        console.log('Instagram scraper initiated...');

        // Make the request to the Instagram scraping endpoint
        const response = await axios.post(endpoint, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const items = response.data;

        // Insert data into MongoDB
        for (const username of startUrls) {
            // Assuming 'items' contains profile data in the required format
            await insertInstagramProfile(username, items);  // Adjust 'items' to match your MongoDB schema if needed
        }

        console.log('Data successfully inserted into MongoDB.');
        return { message: 'Data successfully inserted into MongoDB' };
    } catch (error) {
        console.error('Error scraping Instagram:', error.response ? error.response.data : error.message);
        throw new Error('Error scraping Instagram');
    }
}
