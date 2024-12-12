import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { __dirname } from "../../../../config.ts";
import { insertGoogle, updateUserHistory, uploadToS3 } from "../mongoUtils.ts";

const configBaseDir = path.join(__dirname, "/scraper/src/Helpers/Google");
const outputFileBaseDir = configBaseDir;

const args = process.argv.slice(2);
const email = args[0];

if (!email) {
    console.error(
        "Email is required. Pass it as an environment variable or argument."
    );
    process.exit(1);
}

// Construct the config file path based on the email
const configFileName = `${email.replace(/[^a-zA-Z0-9]/g, "_")}_gconfig.json`;
const configFilePath = path.join(configBaseDir, configFileName);

// Ensure configuration file exists
if (!fs.existsSync(configFilePath)) {
    console.error(
        `Config file not found for email ${email} at ${configFilePath}`
    );
    process.exit(1);
}

// Read configuration
const config = JSON.parse(fs.readFileSync(configFilePath, "utf-8"));
const { userId, range } = config;

// Validate the `range` object
if (
    !range ||
    typeof range !== "object" ||
    !range.from ||
    !range.to ||
    typeof range.from !== "string" ||
    typeof range.to !== "string"
) {
    console.error("Invalid 'range' format in the config file. Expected an object with 'from' and 'to' keys.");
    process.exit(1);
}

// Parse the date range
let startDate, endDate;
try {
    startDate = new Date(range.from.split("-").reverse().join("-"));
    endDate = new Date(range.to.split("-").reverse().join("-"));
} catch (error) {
    console.error("Error parsing dates. Ensure 'from' and 'to' are in 'DD-MM-YYYY' format.");
    process.exit(1);
}

// Validate parsed dates
if (isNaN(startDate) || isNaN(endDate)) {
    console.error("Invalid dates provided in the range.");
    process.exit(1);
}

console.log(`Parsed date range: From ${startDate.toDateString()} to ${endDate.toDateString()}`);

// Define the output file for logs
const outputFile = path.join(
    outputFileBaseDir,
    `${email.replace(/[^a-zA-Z0-9]/g, "_")}_log.txt`
);

(async () => {
    const browser = await chromium.connectOverCDP("http://localhost:9223");

    try {
        // Access the first context or create a new one
        const context = browser.contexts()[0] || (await browser.newContext());
        const page = await context.newPage();

        // Navigate to the target URL
        await page.goto(
            "https://myactivity.google.com/activitycontrols/webandapp?hl=en",
            { waitUntil: "domcontentloaded" }
        );

        console.log("Page loaded.");

        // Wait for the `div` with `role="list"`
        const listSelector = 'div[role="list"]';
        await page.waitForSelector(listSelector, { timeout: 10000 });
        const list = await page.$(listSelector);

        if (!list) {
            throw new Error("List element not found.");
        }

        console.log("Found the list element.");

        let previousItemCount = 0;

        while (true) {
            // Get all `c-wiz` elements and divs with `data-date` inside the list
            const items = await list.$$("c-wiz, div[data-date]");
            console.log(`Found ${items.length} items in the list.`);

            if (items.length === previousItemCount) {
                console.log("No new items loaded. Stopping scroll.");
                break;
            }

            previousItemCount = items.length;

            // Log content of all items to the log file
            for (const item of items) {
                const dataDateStr = await item.getAttribute("data-date");
                const innerText = await item.innerText();

                if (dataDateStr) {
                    // Parse YYYYMMDD into a Date object
                    const dataDate = new Date(
                        `${dataDateStr.slice(0, 4)}-${dataDateStr.slice(
                            4,
                            6
                        )}-${dataDateStr.slice(6)}`
                    );

                    if (dataDate < startDate || dataDate > endDate) {
                        console.log("Date out of range. Stopping.");
                        return;
                    }
                }

                const logEntry = dataDateStr
                    ? `Date: ${dataDateStr}\nContent:\n${innerText}\n\n`
                    : `Content:\n${innerText}\n\n`;

                fs.appendFileSync(outputFile, logEntry, "utf8");
            }

            console.log("Logged items to file.");

            // Scroll to the last item
            const lastItem = items[items.length - 1];
            await lastItem.scrollIntoViewIfNeeded();

            console.log(
                "Scrolled to the last item. Waiting for more items to load..."
            );

            await page.waitForTimeout(2000); // Adjust delay as needed
        }

        console.log(`Final log written to ${outputFile}`);

        // Upload to S3 and MongoDB
        const s3url = await uploadToS3(outputFile, `${email}_activity_google`);
        fs.unlinkSync(outputFile);

        const result = await insertGoogle(email, s3url, "google");
        await updateUserHistory(userId, email, result, 'google')
        console.log("Upload complete:", result);
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        await browser.close();
    }
})();
