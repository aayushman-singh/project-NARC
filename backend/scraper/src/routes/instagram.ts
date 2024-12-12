import express from "express";
import cors from "cors";
import { scrapeInstagramProfiles } from "../Helpers/Instagram/InstagramProfile.js";
import { scrapeInstagramPosts } from "../Helpers/Instagram/InstagramPosts.js";
import { InstaScraper } from "../Helpers/Instagram/InstaScraper.js";
import InstagramUser, { IInstagramUser } from "../models/InstagramUser.js";
import retry from "async-retry"; // For retry logic
import "../../../../config.js";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { updateUserHistory } from "../Helpers/mongoUtils.js";
const app = express();

const PORT = Number(process.env.PORT) || 3001; // Instagram Scraper Port
const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/instagramDB?retryWrites=true&w=majority",
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            } as mongoose.ConnectOptions,
        );
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

connectDB();
app.use(express.json());
app.use(cors());

app.post("/instagram", async (req, res) => {
    const { userId, startUrls, password, limit } = req.body;

    // Check if startUrls is undefined or not an array
    if (!startUrls || !Array.isArray(startUrls)) {
        console.error("Invalid or missing startUrls:", req.body);
        return res
            .status(400)
            .json({ error: "startUrls must be an array of usernames" });
    }

    try {
        console.log(`Received request to scrape ${startUrls.length} profiles`);

        // Scraping profiles with retry logic
        await retry(
            async () => {
                console.log("Starting profile scraping...");
                await scrapeInstagramProfiles(startUrls);
                console.log("Profile scraping completed");
            },
            {
                retries: 3,
                onRetry: (err, attempt) => {
                    console.log(
                        `Retrying profile scraping, attempt ${attempt} after error: ${err.message}`,
                    );
                },
            },
        );

        // Scraping posts with retry logic
        await retry(
            async () => {
                console.log("Starting post scraping...");
                await scrapeInstagramPosts(startUrls, limit);
                console.log("Post scraping completed");
            },
            {
                retries: 3,
                onRetry: (err, attempt) => {
                    console.log(
                        `Retrying post scraping, attempt ${attempt} after error: ${err.message}`,
                    );
                },
            },
        );

        // Scraping followers and following with retry logic
        for (const username of startUrls) {
            await retry(
                async () => {
                    console.log(
                        `Starting data scraping for username: ${username}`,
                    );
                    const resultId = await InstaScraper(username, password);
                    await updateUserHistory(
                        userId,
                        startUrls,
                        resultId,
                        "instagram",
                    );
                    console.log(`Data scraping for ${username} completed`);
                },
                {
                    retries: 3,
                    onRetry: (err, attempt) => {
                        console.log(
                            `Retrying scraping for ${username}, attempt ${attempt} after error: ${err.message}`,
                        );
                    },
                },
            );
        }

        return res.status(200).json({ message: "Scraping complete" });
    } catch (error: any) {
        console.error("Error scraping Instagram:", error.message);
        return res
            .status(500)
            .json({
                error: "Error scraping Instagram",
                details: error.message,
            });
    }
});
app.get("/instagram/users", async (req: Request, res: Response) => {
    try {
        console.log("Fetching users from database...");
        const users: IInstagramUser[] = await InstagramUser.find().lean();
        console.log(`Found ${users.length} users`);

        if (users.length === 0) {
            console.log("No users found in the database");
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: (error as Error).message });
    }
});

app.get("/instagram/users/:username", async (req: Request, res: Response) => {
    const { username } = req.params;

    try {
        console.log(`Fetching user with username: ${username}`);
        const user: IInstagramUser | null = await InstagramUser.findOne({
            username,
        }).lean();

        if (!user) {
            console.log(`User not found: ${username}`);
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`User found: ${username}`);
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: (error as Error).message });
    }
});
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Instagram scraper listening on port ${PORT}`);
});
