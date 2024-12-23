import express from "express";
import cors from "cors";
import { scrapeDiscord } from "../Helpers/Discord/discordScraper";
import retry from "async-retry"; // For retry logic
import "../../../config.js";
import DiscordUser, { IDiscordUser } from "../models/DiscordUser";
import mongoose from "mongoose";
import { Request, Response } from "express";
const app = express();
const PORT = 3011; // Discord Scraper Port

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/discordDB?retryWrites=true&w=majority",
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            } as mongoose.ConnectOptions
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

// Route to trigger Discord scraping
app.post("/discord", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        console.error("Missing username or password in request:", req.body);
        return res
            .status(400)
            .json({ error: "Username and password are required" });
    }

    try {
        console.log(`Received request to scrape Discord for user: ${username}`);

        // Retry logic for scraping
        await retry(
            async () => {
                console.log("Starting Discord scraping...");
                await scrapeDiscord(username, password);
                console.log("Discord scraping completed");
            },
            {
                retries: 3,
                onRetry: (err, attempt) => {
                    console.log(
                        `Retrying Discord scraping, attempt ${attempt} after error: ${err.message}`
                    );
                },
            }
        );

        return res.status(200).json({ message: "Scraping complete" });
    } catch (error: any) {
        console.error("Error scraping Discord:", error.message);
        return res.status(500).json({
            error: "Error scraping Discord",
            details: error.message,
        });
    }
});

// Fetch data (example endpoint, can be customized)
app.get("/discord/data", async (req, res) => {
    try {
        console.log("Fetching scraped data from the database...");
        const data = await mongoose.connection
            .collection("discordChats")
            .find()
            .toArray();

        if (!data.length) {
            console.log("No data found in the database");
            return res.status(404).json({ message: "No data found" });
        }

        console.log(`Found ${data.length} entries`);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: error.message });
    }
});
app.get("/discord/users", async (req: Request, res: Response) => {
    try {
        console.log("Fetching users from database...");
        const users: IDiscordUser[] = await DiscordUser.find().lean();
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

app.get("/discord/users/:username", async (req: Request, res: Response) => {
    const { username } = req.params;

    try {
        console.log(`Fetching user with username: ${username}`);
        const user: IDiscordUser | null = await DiscordUser.findOne({
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
// Start the server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Discord scraper listening on port ${PORT}`);
});
