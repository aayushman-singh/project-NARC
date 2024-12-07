import express from "express";
import { exec } from "child_process";
import path from "path";
import cors from 'cors';
import '../../../config.js';

const app = express();
const PORT = 3007;
app.use(cors());
app.post("/trigger-scraping", (req, res) => {
    console.log("Triggering Chrome with remote debugging...");

    // Step 1: Launch Chrome in debugging mode
    const chromeCommand = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9223 --user-data-dir="C:\\Temp\\ChromeProfile"`;

    const chromeProcess = exec(chromeCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting Chrome: ${error.message}`);
            res.status(500).json({
                success: false,
                message: "Failed to start Chrome.",
            });
            return;
        }
        console.log("Chrome launched successfully.");
    });

    // Step 2: Delay for 60 seconds
    setTimeout(() => {
        console.log("Running Playwright script...");

        // Step 3: Run the Playwright script
        const playwrightScript = path.join(__dirname, "../Helpers/Google","webHistory.ts");
        const nodeCommand = `npx tsx "${playwrightScript}"`;

        exec(nodeCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(
                    `Error running Playwright script: ${error.message}`
                );
                res.status(500).json({
                    success: false,
                    message: "Failed to run Playwright script.",
                });
                return;
            }
            console.log("Playwright script executed successfully.");
            res.status(200).json({
                success: true,
                message: "Scraping completed.",
            });
        });
    }, 60000); // 60-second delay
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
