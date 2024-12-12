import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { __dirname } from "../../../../config.ts";
import { updateUserHistory, uploadScreenshotToMongo } from "../mongoUtils.ts";

// Get the email argument from the command line
const email = process.argv[2];

if (!email ) {
    console.error("Error: Email argument is required.");
    process.exit(1);
}

// Define base directories
const configBaseDir = path.join(__dirname, "/scraper/src/Helpers/Google");
const outputFileBaseDir = configBaseDir;

async function extractUserIdFromConfig(configPath) {
    try {
        // Read the config file
        const configContent = await fs.readFile(configPath, 'utf8');
        
        // Parse the JSON content
        const config = JSON.parse(configContent);
        
        // Check if userId exists in the config
        if (!config.userId) {
            throw new Error('userId not found in config file');
        }
        
        return config.userId;
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`Config file not found at path: ${configPath}`);
        }
        throw error;
    }
}

const userId = await extractUserIdFromConfig(configBaseDir);

// Define the output file for logs
const outputFile = path.join(
    outputFileBaseDir,
    `${email.replace(/[^a-zA-Z0-9]/g, "_")}_log.txt`
);
let resultId;
(async () => {
    let browser;
    try {
        // Connect to the existing Chrome instance with remote debugging enabled
        browser = await chromium.connectOverCDP("http://localhost:9223");
        
        // Reuse the default browser context
        const [defaultContext] = await browser.contexts();

        if (!defaultContext) {
            throw new Error("No existing browser context found.");
        }

        // Create a new page in the existing context
        const page = await defaultContext.newPage();

        // Navigate to timeline.google.com
        await page.goto("https://timeline.google.com");

        // Wait for the page to load
        await page.waitForTimeout(2000); // Adjust timeout as needed

        // Locate the modal first
        const modalSelector = "div.goog-modalpopup";
        const modal = await page.waitForSelector(modalSelector, { timeout: 3000 });

        if (modal) {
            console.log("Modal found.");

            // Select the second child div within the modal
            const secondChildSelector = `${modalSelector} > div > div:nth-child(2)`;
            const secondChild = await page.$(secondChildSelector);

            if (secondChild) {
                console.log("Second child found.");

                // Find the div with class material-flat-button inside the second child and click it
                const buttonSelector = `${secondChildSelector} .material-flat-button`;
                const button = await page.$(buttonSelector);

                if (button) {
                    console.log("Button found. Clicking...");
                    await button.click();
                } else {
                    console.log("Button not found.");
                }
            } else {
                console.log("Second child not found.");
            }
        } else {
            console.log("Modal not found.");
        }

        // Continue with other tasks if needed
        console.log("Performing other tasks...");

        try {
            // Wait for the button to appear in the DOM
            const buttonSelector = 'button.material-flat-button.header-today-button[jsaction="O3yZSc"]';
            await page.waitForSelector(buttonSelector, { timeout: 5000 }); // Adjust timeout as needed
    
            // Click on the button
            await page.click(buttonSelector);
            console.log("Clicked the 'Today' button successfully.");
        } catch (error) {
            console.error("Error clicking the 'Today' button:", error);
        }

        try {
            for (let i = 1; i <= 10; i++) {
                console.log(`Iteration ${i} started.`);
    
                // Take a screenshot
                const screenshotPath = path.join(__dirname,'scraper/src/Helpers/Google', `timeline_screenshot_${i}.png`);
                await page.screenshot({ path: screenshotPath });
                console.log(`Screenshot saved: ${screenshotPath}`);
    
                // Upload the screenshot to MongoDB
                resultId = await uploadScreenshotToMongo(email, screenshotPath, `timeline_${i}`, 'timeline');
                await updateUserHistory(
                    userId,
                    email,
                    resultId,
                    "google-timeline"
                );
                // Click the specified button
                const buttonSelector = "#map-page > div.map-page-content-wrapper > div > div > div.timeline-wrapper.invalidate-overlay > div.timeline-header > i.timeline-header-button.previous-date-range-button.material-icons-extended.material-icon-with-ripple.rtl-mirrored";
                await page.click(buttonSelector);
                console.log(`Clicked the button for iteration ${i}.`);
    
                // Wait for 5 seconds before the next iteration
                await page.waitForTimeout(5000);
            }
        } catch (error) {
            console.error("Error during the iterations:", error);
        }

        // Save a log to the output file
        fs.writeFileSync(outputFile, "Scraping completed successfully.");
        console.log("Scraping completed successfully. Log saved.");
        
    } catch (error) {
        console.error("An error occurred during scraping:", error);
        fs.writeFileSync(outputFile, `Error: ${error.message}`);
    } finally {
        // Do not close the browser, as it is shared
        console.log("Finished task. Browser remains open.");
    }
})();
