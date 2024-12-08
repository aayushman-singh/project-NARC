import express from "express";
import { exec, execSync } from "child_process";
import path from "path";
import fs from "fs";
import cors from "cors";
import { __dirname } from "../../../config.js";

const app = express();
const PORT = 3008;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

app.post("/trigger-scraping", (req, res) => {
    const { email, range } = req.body;

    if (!email || !range) {
        return res.status(400).json({
            success: false,
            message: "Email and date range are required.",
        });
    }

    console.log("Triggering Chrome with remote debugging...");

    // Step 1: Launch Chrome in debugging mode
    const chromeCommand = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9223 --user-data-dir="C:\\Temp\\ChromeProfile"`;

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

    // Step 3: Ensure directory exists and write email and range to a temporary config file
    const dirPath = path.join(__dirname, "scraper/src/Helpers/Google");
    const configFilePath = path.join(dirPath, "ytconfig.json");

    // Check if the directory exists, create if not
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Directory created: ${dirPath}`);
    } else {
        console.log(`Directory already exists: ${dirPath}`);
    }

    // Write email and range to the config file
    fs.writeFileSync(
        configFilePath,
        JSON.stringify({ email: email, range }, null, 2)
    );
    console.log(`Config file written to: ${configFilePath}`);

    // Step 2: Delay for 30 seconds
    setTimeout(() => {
        console.log("Running Playwright script...");

        // Step 4: Run the Playwright script
        const playwrightScript = path.join(
            __dirname,
            "scraper/src/Helpers/Google",
            "youtubeHistory.ts"
        );
        const nodeCommand = `npx tsx "${playwrightScript}"`;

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

            // Cleanup: Remove the config file after use
            fs.unlinkSync(configFilePath);
        });
    }, 10000); // 30-second delay
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
