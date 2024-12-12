import express from "express";
import cors from "cors";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { scrapeFacebook } from "../Helpers/Facebook/FacebookTimeline.js";
import { updateUserHistory } from "../Helpers/mongoUtils.js";
import FacebookUser, { IFacebookUser } from "../models/FacebookUser.js";
import "../../../../config.js";

const app = express();
const PORT = Number(process.env.PORT) || 3002;
const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/facebookDB?retryWrites=true&w=majority",
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

app.post("/facebook", async (req, res) => {
    const { userId, startUrls, password, pin, limit } = req.body;

    // Check if startUrls is undefined or not an array
    if (!startUrls || !Array.isArray(startUrls)) {
        console.error("Invalid or missing startUrls:", req.body);
        return res
            .status(400)
            .json({ error: "startUrls must be an array of usernames" });
    }

    try {
        console.log("Scraping facebook...");
        for (const username of startUrls) {
            const resultId = await scrapeFacebook(
                username,
                password,
                pin,
                limit,
            );
            await updateUserHistory(userId, startUrls, resultId, "facebook");
        }

        return res.status(200).json("Success"); // Return final response with status 200
    } catch (error: any) {
        console.error("Error scraping Facebook:", error.message);
        return res.status(500).send("Error scraping Facebook");
    }
});
app.get("/facebook/users", async (req: Request, res: Response) => {
    try {
        console.log("Fetching users from database...");
        const users: IFacebookUser[] = await FacebookUser.find().lean();
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

app.get("/facebook/users/:username", async (req: Request, res: Response) => {
    const { username } = req.params;

    try {
        console.log(`Fetching user with username: ${username}`);
        const user: IFacebookUser | null = await FacebookUser.findOne({
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
    console.log(`Facebook scraper listening on port ${PORT}`);
});
