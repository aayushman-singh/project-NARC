import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { __dirname } from "../../../../../config.js";
import { updateUserHistory, uploadScreenshotToMongo } from "../mongoUtils.js";

// Get the email argument from the command line
const email = process.argv[2];

// Initialize logging function
const log = (message, type = "info") => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(logMessage);

    // Also write to file if outputFile is defined
    if (typeof outputFile !== "undefined") {
        fs.appendFileSync(outputFile, logMessage + "\n");
    }
};

if (!email) {
    log("Email argument is required.", "error");
    process.exit(1);
}

// Define base directories
const configBaseDir = path.join(__dirname, "/scraper/src/Helpers/Google");
const outputFileBaseDir = configBaseDir;
const configFilePath = path.join(
    configBaseDir,
    `${email.replace(/[^a-zA-Z0-9]/g, "_")}_tconfig.json`
);

// Define the output file for logs
const outputFile = path.join(
    outputFileBaseDir,
    `${email.replace(/[^a-zA-Z0-9]/g, "_")}_log.txt`
);

// Initialize log file
fs.writeFileSync(
    outputFile,
    `=== Timeline Scraping Session Started: ${new Date().toISOString()} ===\n`
);

// Read config and extract userId with logging
let config;
let userId;

try {
    log(`Reading config file from: ${configFilePath}`);

    if (!fs.existsSync(configFilePath)) {
        throw new Error(`Config file not found: ${configFilePath}`);
    }

    const configContent = fs.readFileSync(configFilePath, "utf-8");
    config = JSON.parse(configContent);

    if (!config.userId) {
        throw new Error("userId not found in config file");
    }

    userId = config.userId;
    log(`Successfully loaded config for user ID: ${userId}`);
} catch (error) {
    log(`Config loading failed: ${error.message}`, "error");
    process.exit(1);
}

let resultId;
(async () => {
    let browser;
    try {
        log("Attempting to connect to Chrome instance...");
        browser = await chromium.connectOverCDP("http://localhost:9223");
        log("Successfully connected to Chrome instance");

        const [defaultContext] = await browser.contexts();
        if (!defaultContext) {
            throw new Error("No existing browser context found.");
        }
        log("Found existing browser context");

        log("Creating new page...");
        const page = await defaultContext.newPage();

        log("Navigating to timeline.google.com...");
        await page.goto("https://timeline.google.com");
        log("Navigation complete");

        await page.waitForTimeout(2000);

        // Modal handling with logging
        log("Looking for modal...");
        const modalSelector = "div.goog-modalpopup";
        const modal = await page.waitForSelector(modalSelector, {
            timeout: 3000,
        });

        if (modal) {
            log("Modal found, processing...");
            const secondChildSelector = `${modalSelector} > div > div:nth-child(2)`;
            const secondChild = await page.$(secondChildSelector);

            if (secondChild) {
                log("Found modal's second child element");
                const buttonSelector = `${secondChildSelector} .material-flat-button`;
                const button = await page.$(buttonSelector);

                if (button) {
                    log("Found modal button, clicking...");
                    await button.click();
                    log("Modal button clicked");
                } else {
                    log("Modal button not found", "warn");
                }
            } else {
                log("Modal's second child not found", "warn");
            }
        } else {
            log("No modal found", "warn");
        }

        try {
            log("Looking for 'Today' button...");
            const buttonSelector =
                'button.material-flat-button.header-today-button[jsaction="O3yZSc"]';
            await page.waitForSelector(buttonSelector, { timeout: 5000 });
            await page.click(buttonSelector);
            log("Successfully clicked 'Today' button");
        } catch (error) {
            log(`Failed to click 'Today' button: ${error.message}`, "error");
        }

        try {
            for (let i = 1; i <= 10; i++) {
                log(`Starting iteration ${i} of 10`);

                const screenshotPath = path.join(
                    __dirname,
                    "scraper/src/Helpers/Google",
                    `timeline_screenshot_${i}.png`
                );
                await page.screenshot({ path: screenshotPath });
                log(`Saved screenshot ${i}: ${screenshotPath}`);

                resultId = await uploadScreenshotToMongo(
                    email,
                    screenshotPath,
                    `timeline_${i}`,
                    "timeline"
                );
                log(
                    `Uploaded screenshot ${i} to MongoDB with resultId: ${resultId}`
                );

                await updateUserHistory(
                    userId,
                    email,
                    resultId,
                    "google-timeline"
                );
                log(`Updated user history for screenshot ${i}`);

                const buttonSelector =
                    "#map-page > div.map-page-content-wrapper > div > div > div.timeline-wrapper.invalidate-overlay > div.timeline-header > i.timeline-header-button.previous-date-range-button.material-icons-extended.material-icon-with-ripple.rtl-mirrored";
                await page.click(buttonSelector);
                log(`Clicked 'previous' button for iteration ${i}`);

                await page.waitForTimeout(5000);
                log(`Completed iteration ${i}`);
            }
        } catch (error) {
            log(`Error during iteration: ${error.message}`, "error");
        }

        log("Scraping completed successfully");
    } catch (error) {
        log(`Scraping failed: ${error.message}`, "error");
    } finally {
        log("Task finished, browser remains open");
        log(
            `=== Timeline Scraping Session Ended: ${new Date().toISOString()} ===\n`
        );
    }
})();
