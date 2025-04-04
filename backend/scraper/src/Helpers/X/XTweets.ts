// XPosts.ts
import axios from "axios";
import { insertTweets } from "../mongoUtils.js"; // MongoDB utility function

// Exported function for scraping X posts
export async function XTweets(startUrls: string[]) {
    const fullUrls = startUrls.map(
        (username: string) => `https://www.x.com/${username}/`,
    );
    const endpoint =
        "https://api.apify.com/v2/acts/gentle_cloud~twitter-tweets-scraper/run-sync-get-dataset-items?token=apify_api_PX0pmbuYEg3gO4cHjqIb8D8ah9MOnr2lJs5D";

    const data = {
        result_count: "1",
        startUrls: [
            {
                url: fullUrls,
                method: "GET",
            },
        ],
    };

    try {
        console.log("X scraper initiated for posts...");

        // Call the Apify X scraper endpoint
        const response = await axios.post(endpoint, data, {
            headers: { "Content-Type": "application/json" },
        });

        const items = response.data;
        console.log(`Scraped ${items.length} posts from ${startUrls[0]}`);

        // Insert the posts into MongoDB for each username
        for (const username of startUrls) {
            await insertTweets(username, items, "twitter");
        }

        console.log("Tweets successfully inserted into MongoDB.");

        return {
            message: `Posts successfully inserted into collection for ${startUrls.join(", ")}`,
        };
    } catch (error) {
        console.error(
            "Error scraping X posts:",
            error.response ? error.response.data : error.message,
        );
        throw new Error("Error scraping X posts");
    }
}
