import express from "express";
import { scrapeX } from "../Helpers/X/Xtimeline"; // Adjust the path to your scraper file
import { XTweets } from "../Helpers/X/XTweets";
import cors from "cors";
import { Request, Response } from "express";
import TwitterUser from "../models/TwitterUser";
import { ITwitterUser } from "../models/TwitterUser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { updateUserHistory } from "../Helpers/mongoUtils";

dotenv.config();
const port = Number(process.env.PORT) || 3003;
const app = express();

const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/twitterDB?retryWrites=true&w=majority",
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
app.use(cors());
app.use(express.json());

// Define a POST route to trigger the scraping
app.post("/x", async (req, res) => {
    const { userId, startUrls, password } = req.body;

    // Check if startUrls is undefined or not an array
    if (!startUrls || !Array.isArray(startUrls)) {
        console.error("Invalid or missing startUrls:", req.body);
        return res
            .status(400)
            .json({ error: "startUrls must be an array of usernames" });
    }

    try {
        console.log("Starting X profile scraper...");
        for (const username of startUrls) {
            const resultId = await scrapeX(username, password);
            updateUserHistory(userId, startUrls, resultId, "twitter");
        }

        console.log("Profile scraping completed successfully.");

        console.log("Starting tweets scraping...");
        await XTweets(startUrls);

        console.log("Tweets scraping completed successfully.");
        return res.status(200).send("Scraping completed successfully.");
    } catch (error) {
        console.error("Error during scraping:", error);
        return res.status(500).send("Scraping failed.");
    }
});
app.get("/x/users", async (req: Request, res: Response) => {
    try {
        console.log("Fetching users from Twitter database...");
        const users: ITwitterUser[] = await TwitterUser.find().lean();
        console.log(`Found ${users.length} users`);

        if (users.length === 0) {
            console.log("No users found in the database");
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching Twitter users:", error);
        res.status(500).json({ error: (error as Error).message });
    }
});

// Route to fetch a specific Twitter user by username
app.get("/x/users/:username", async (req: Request, res: Response) => {
    const { username } = req.params;

    try {
        console.log(`Fetching Twitter user with username: ${username}`);
        const user: ITwitterUser | null = await TwitterUser.findOne({
            username,
        }).lean();

        if (!user) {
            console.log(`Twitter user not found: ${username}`);
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`Twitter user found: ${username}`);
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching Twitter user:", error);
        res.status(500).json({ error: (error as Error).message });
    }
});
// Start the Express server
app.listen(port, "0.0.0.0", () => {
    console.log(`X scraper is running on port ${port}`);
});
