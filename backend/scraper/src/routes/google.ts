import express from "express";
import { exec, execSync } from "child_process";
import path from "path";
import fs from "fs";
import cors from "cors";
import { __dirname } from "../../../../config.js";
import { Request, Response } from "express";
import mongoose from "mongoose";
import GoogleUser, { IGoogleUser } from "../models/GoogleSearchUser.js";
const app = express();
const PORT = 3007;
const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/googleDB?retryWrites=true&w=majority",
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
app.use(express.json()); // Middleware to parse JSON bodies
app.get("/google/users", async (req: Request, res: Response) => {
    try {
        console.log("Fetching users from database...");
        const users: IGoogleUser[] = await GoogleUser.find().lean();
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

app.get("/google/users/:email", async (req: Request, res: Response) => {
    const { email } = req.params;

    try {
        console.log(`Fetching user with email: ${email}`);
        const user: IGoogleUser | null = await GoogleUser.findOne({
            email, // Use email as the identifier
        }).lean();

        if (!user) {
            console.log(`User not found: ${email}`);
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`User found: ${email}`);
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: (error as Error).message });
    }
});

app.post("/googleSearch/trigger-scraping", (req, res) => {
    const { userId, email, range } = req.body;

    if (!email || !range) {
        return res.status(400).json({
            success: false,
            message: "Email and date range are required.",
        });
    }

    console.log("Triggering Chrome with remote debugging...");

    // Step 1: Define a unique Chrome profile directory for the email
    const emailProfileDir = path.join(
        "C:\\Temp\\ChromeProfiles",
        email.replace(/[^a-zA-Z0-9]/g, "_")
    );

    // Check if the directory exists
    if (!fs.existsSync(emailProfileDir)) {
        console.log(
            `Creating new Chrome profile directory for email: ${email}`
        );
        fs.mkdirSync(emailProfileDir, { recursive: true });
    } else {
        console.log(
            `Reusing existing Chrome profile directory for email: ${email}`
        );
    }

    // Step 2: Launch Chrome with the user-specific profile
    const chromeCommand = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9223 --user-data-dir="${emailProfileDir}"`;

    const chromeProcess = exec(chromeCommand, (error) => {
        if (error) {
            console.error(`Error starting Chrome: ${error.message}`);
            return res.status(500).json({
                success: false,
                message: "Failed to start Chrome.",
            });
        }
        console.log("Chrome launched successfully.");
    });

    // Step 3: Ensure the config directory exists and write email and range to a temporary config file
    const dirPath = path.join(__dirname, "scraper/src/Helpers/Google");
    const configFilePath = path.join(
        dirPath,
        `${email.replace(/[^a-zA-Z0-9]/g, "_")}_gconfig.json`
    );

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Directory created: ${dirPath}`);
    } else {
        console.log(`Directory already exists: ${dirPath}`);
    }

    // Write email and range to the config file
    fs.writeFileSync(
        configFilePath,
        JSON.stringify({ userId:userId, email: email, range:range }, null, 2)
    );
    console.log(`Config file written to: ${configFilePath}`);

    // Step 4: Delay for 10 seconds before running the Playwright script
    setTimeout(() => {
        console.log("Running Playwright script...");

        // Run the Playwright script
        const playwrightScript = path.join(
            __dirname,
            "scraper/src/Helpers/Google",
            "webHistory.ts"
        );
        const nodeCommand = `npx tsx "${playwrightScript}" ${email}`;

        exec(nodeCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(
                    `Error running Playwright script: ${error.message}`
                );
                return res.status(500).json({
                    success: false,
                    message: "Failed to run Playwright script.",
                });
            }
            console.log("Playwright script executed successfully.");
            console.log(stdout);
            res.status(200).json({
                success: true,
                message: "Scraping completed.",
            });

            // Cleanup: Optionally remove the config file after use
            if (fs.existsSync(configFilePath)) {
                fs.unlinkSync(configFilePath);
                console.log(`Config file removed: ${configFilePath}`);
            }
        });
    }, 35000); 
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});