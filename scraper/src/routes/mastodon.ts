import express from "express";
import cors from "cors";
import { scrapeMastodon } from "../Helpers/Mastodon/mastodonScraper"; // Adjust path as needed
import { Request, Response } from "express";
import MastodonUser, {IMastodonUser} from "../models/MostodenUser";
import mongoose from "mongoose";
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/mastodonDB?retryWrites=true&w=majority",
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
interface ScrapingRequest {
    email: string;
    password: string;
    userId: string;
}

// GET endpoint to check if server is running
app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "Server is running" });
});

// POST endpoint to trigger scraping
app.post("/mastodon", async (req: Request, res: Response) => {
    const { email, password, userId }: ScrapingRequest = req.body;

    // Validate required fields
    if (!email || !password || !userId) {
        return res.status(400).json({
            success: false,
            message:
                "Missing required fields: email, password, and userId are required",
        });
    }

    try {
        console.log(`Starting Mastodon scraping for user: ${email}`);

        const result = await scrapeMastodon(email, password, userId);

        if (result.success) {
            res.json({
                success: true,
                message: "Scraping completed successfully",
                data: {
                    articlesCount: result.articlesCount,
                    message: result.message,
                },
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Scraping failed",
                error: result.error,
            });
        }
    } catch (error) {
        console.error("Error during scraping:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});
app.get("/mastodon/users", async (req: Request, res: Response) => {
    try {
        console.log("Fetching users from database...");
        const users: IMastodonUser[] = await MastodonUser.find().lean();
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

app.get("/mastodon/users/:username", async (req: Request, res: Response) => {
    const { username } = req.params;

    try {
        console.log(`Fetching user with username: ${username}`);
        const user: IMastodonUser | null = await MastodonUser.findOne({
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
// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message,
    });
});

const PORT = 3012;

app.listen(PORT, () => {
    console.log(`Mastodon scraping server running on http://localhost:${PORT}`);
});
