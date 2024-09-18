// InstagramPosts.ts
import axios from 'axios';
import { insertInstagramPosts } from '../../mongoUtils.js';  // MongoDB utility function

// Exported function for scraping Instagram posts
export async function scrapeInstagramPosts(startUrls: string[]) {
    const fullUrls = startUrls.map((username: string) => `https://www.instagram.com/${username}/`);
    const endpoint = 'https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=apify_api_PX0pmbuYEg3gO4cHjqIb8D8ah9MOnr2lJs5D';
    
    const data = {
        "addParentData": false,
        "directUrls": fullUrls,
        "enhanceUserSearchWithFacebookPage": false,
        "isUserReelFeedURL": false,
        "isUserTaggedFeedURL": false,
        "resultsLimit": 3,  // Limiting results for testing
        "resultsType": "posts",
        "searchLimit": 1,
        "searchType": "hashtag"
    };

    try {
        console.log('Instagram scraper initiated for posts...');

        // Call the Apify Instagram scraper endpoint
        const response = await axios.post(endpoint, data, {
            headers: { 'Content-Type': 'application/json' }
        });

        const items = response.data;
        console.log(`Scraped ${items.length} posts from ${startUrls[0]}`);

        // Insert the posts into MongoDB for each username
        for (const username of startUrls) {
            await insertInstagramPosts(username, items);
        }

        console.log('Posts successfully inserted into MongoDB.');

      

        return { message: `Posts successfully inserted into collection for ${startUrls.join(', ')}` };
    } catch (error) {
        console.error('Error scraping Instagram posts:', error.response ? error.response.data : error.message);
        throw new Error('Error scraping Instagram posts');
    }
}
