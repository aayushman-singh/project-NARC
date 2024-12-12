import express from "express";
import cors from "cors";
import retry from "async-retry";
import { Request, Response } from "express";
import whatsappScraper from "../Helpers/Whatsapp/whatsappScraper.js";
import WhatsappUser, { IWhatsappUser } from "../models/WhatsAppUser.js";
import mongoose from "mongoose";
import "../../../../config.js";
import { updateUserHistory } from "../Helpers/mongoUtils.js";

const app = express();
const PORT = Number(process.env.PORT) || 3004; // Whatsapp Scraper Port

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/whatsappDB?retryWrites=true&w=majority",
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

app.post("/whatsapp", async (req: Request, res: Response) => {
    const { userId, startUrls, limit } = req.body;

    if (!startUrls || !Array.isArray(startUrls)) {
        console.error("Invalid or missing startUrls:", req.body);
        return res
            .status(400)
            .json({ error: "startUrls must be an array of usernames" });
    }

    try {
        console.log(`Received request to scrape ${startUrls.length} profiles`);

        for (const username of startUrls) {
            await retry(
                async () => {
                    console.log(
                        `Starting data scraping for username: ${username}`,
                    );
                    const resultId = await whatsappScraper(username, limit);
                    updateUserHistory(userId, username, resultId, "whatsapp");
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
        console.error("Error scraping Whatsapp:", error.message);
        return res
            .status(500)
            .json({ error: "Error scraping Whatsapp", details: error.message });
    }
});

app.get("/whatsapp/users", async (req: Request, res: Response) => {
    try {
        console.log("Fetching users from database...");
        const users: IWhatsappUser[] = await WhatsappUser.find().lean();
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

app.get("/whatsapp/users/:username", async (req: Request, res: Response) => {
    const { username } = req.params;

    try {
        console.log(`Fetching user with username: ${username}`);
        const user: IWhatsappUser | null = await WhatsappUser.findOne({
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
    console.log(`Whatsapp scraper listening on port ${PORT}`);
});

export default app;
