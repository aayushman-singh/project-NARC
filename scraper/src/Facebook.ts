import express from "express";
import cors from "cors";
import { scrapeFacebookProfile } from "./Facebook/FacebookProfile";
import { scrapeFacebookPosts } from "./Facebook/FacebookPosts"; // Import the new function
import { scrapeFacebook } from "./Facebook/FacebookTimeline.js";

const app = express();
const PORT = Number(process.env.PORT) || 3002; // Facebook Scraper Port

app.use(express.json());
app.use(cors());

app.post("/facebook", async (req, res) => {
    const { startUrls, password } = req.body;

    // Check if startUrls is undefined or not an array
    if (!startUrls || !Array.isArray(startUrls)) {
        console.error("Invalid or missing startUrls:", req.body);
        return res
            .status(400)
            .json({ error: "startUrls must be an array of usernames" });
    }

    try {
        console.log("Scraping profiles...");
        await scrapeFacebookProfile(startUrls);

        console.log("Scraping followers and following...");
        for (const username of startUrls) {
            await scrapeFacebook(username, password);
        }

        console.log("Scraping posts...");
        const result = await scrapeFacebookPosts(startUrls);

        return res.status(200).json(result); // Return final response with status 200
    } catch (error: any) {
        console.error("Error scraping Facebook:", error.message);
        return res.status(500).send("Error scraping Facebook");
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Facebook scraper listening on port ${PORT}`);
});
