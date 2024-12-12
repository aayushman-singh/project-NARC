import { ElementHandle, Page } from "playwright";
import fs from "fs";
import path from "path";
import { __dirname } from "../../../../../config.js";

export async function scrapeFacebookActivity(page: Page) {
    try {
        // Define the log directory and file
        const logDir = path.join(
            __dirname,
            "scraper/src/Helpers/Facebook/logs"
        );
        const logFile = path.join(logDir, "activity_log.txt");
        const errorLogFile = path.join(logDir, "error_log.txt");

        // Ensure the log directory exists
        fs.mkdirSync(logDir, { recursive: true });

        // Function to append logs to the file
        const writeLog = (message: string) => {
            fs.appendFileSync(logFile, `${message}\n`, "utf8");
        };

        console.log("Navigating to Facebook login activity...");
        writeLog("Navigating to Facebook login activity...");
        await page.goto("https://facebook.com/login_activity", {
            waitUntil: "domcontentloaded",
        });

        // Generalized CSS selector for the target element
        const buttonSelector =
            'div[id^="mount_"] div > div:nth-child(3) div > div:nth-child(2) div > div > div:nth-child(11) [role="button"]';

        console.log("Waiting for the target button...");
        writeLog("Waiting for the target button...");
        const buttonLocator = page.locator(buttonSelector);

        if (await buttonLocator.isVisible()) {
            console.log("Clicking the button...");
            writeLog("Clicking the button...");
            await buttonLocator.click();
            console.log("Button clicked successfully.");
            writeLog("Button clicked successfully.");
        } else {
            const buttonError = "Button not found or not visible.";
            console.error(buttonError);
            writeLog(buttonError);
        }

        // CSS selector for the parent element containing all children
        const parentSelector =
            'div[id^="mount_"] div > div:nth-child(3) div > div:nth-child(2) div > div > div';

        console.log("Waiting for the parent element...");
        writeLog("Waiting for the parent element...");
        const parentLocator = page.locator(parentSelector);

        if (!(await parentLocator.isVisible())) {
            throw new Error("Parent element not found or not visible.");
        }

        // Get all child divs inside the parent element
        const childDivs = parentLocator.locator(":scope > div");
        const childCount = await childDivs.count();

        if (childCount === 0) {
            throw new Error("No child divs found in the parent element.");
        }

        console.log(`Found ${childCount} child divs.`);
        writeLog(`Found ${childCount} child divs.`);

        // Iterate over each child div and log its details
        for (let i = 0; i < childCount; i++) {
            const child = childDivs.nth(i);

            console.log(`Scraping details for child ${i + 1}...`);
            writeLog(`Scraping details for child ${i + 1}...`);

            // Scrape specific details (e.g., text content)
            const details =
                (await child.textContent())?.trim() ||
                "No text content available";
            console.log(`Text Content: ${details}`);
            writeLog(`Text Content: ${details}`);

            // Log any specific attributes if needed
            const attributes = await child.evaluate((node) =>
                Array.from(node.attributes).map((attr) => ({
                    name: attr.name,
                    value: attr.value,
                }))
            );

            console.log(`Attributes: ${JSON.stringify(attributes)}`);
            writeLog(`Attributes: ${JSON.stringify(attributes)}`);
        }
    } catch (error) {
        const errorMessage = `Error during scraping: ${error.message}`;
        console.error(errorMessage);

        const logDir = path.join(
            __dirname,
            "scraper/src/Helpers/Facebook/logs"
        );
        const errorLogFile = path.join(logDir, "error_log.txt");

        fs.appendFileSync(errorLogFile, `${errorMessage}\n`, "utf8");
    }
}