import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { __dirname } from "../../../../config.ts";
import { insertGoogle, uploadToS3 } from "../mongoUtils.ts";

// Define the base directory for configuration and logs
const configBaseDir = path.join(__dirname, "/scraper/src/Helpers/Google");
const outputFileBaseDir = configBaseDir;

const args = process.argv.slice(2);
const email = args[0];

if (!email) {
    console.error("Email is required. Pass it as an environment variable or argument.");
    process.exit(1);
}

// Construct the config file path based on the email
const configFileName = `${email.replace(/[^a-zA-Z0-9]/g, "_")}_ytconfig.json`;
const configFilePath = path.join(configBaseDir, configFileName);

// Ensure configuration file exists
if (!fs.existsSync(configFilePath)) {
    console.error(`Config file not found for email ${email} at ${configFilePath}`);
    process.exit(1);
}

// Read configuration
const config = JSON.parse(fs.readFileSync(configFilePath, "utf-8"));
const { range } = config;

if (!range) {
    console.error("Date range is required in the config file.");
    process.exit(1);
}

// Parse the date range
let startDate: Date;
let endDate: Date;

const outputFile = path.join(
    outputFileBaseDir,
    `${email.replace(/[^a-zA-Z0-9]/g, "_")}_log.txt`
);

if (typeof range === "string" && range.includes(" to ")) {
    // Handle string range like "1-12-2024 to 2-12-2024"
    const [from, to] = range.split(" to ").map((dateStr) =>
        dateStr.trim().split("-").reverse().join("-")
    );
    startDate = new Date(from);
    endDate = new Date(to);
} else if (typeof range === "object" && range.from && range.to) {
    // Handle object range like { from: "1-12-2024", to: "2-12-2024" }
    startDate = new Date(range.from.split("-").reverse().join("-"));
    endDate = new Date(range.to.split("-").reverse().join("-"));
} else {
    throw new Error("Invalid date range format in the config file.");
}

// Validate parsed dates
if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid start or end date. Check the date format.");
}

console.log("Parsed Start Date:", startDate);
console.log("Parsed End Date:", endDate);

(async () => {
    const browser = await chromium.connectOverCDP("http://localhost:9223");

    try {
        const context = browser.contexts()[0] || (await browser.newContext());
        const page = await context.newPage();

        // Navigate to the YouTube history page
        await page.goto(
            "https://myactivity.google.com/product/youtube?hl=en",
            { waitUntil: "domcontentloaded" }
        );

        console.log("Page loaded.");

        const listSelector = 'div[role="list"]';
        await page.waitForSelector(listSelector, { timeout: 10000 });
        const list = await page.$(listSelector);

        if (!list) {
            throw new Error("List element not found.");
        }

        console.log("Found the list element.");

        let previousItemCount = 0;

        while (true) {
            const items = await list.$$("c-wiz, div[data-date]");
            console.log(`Found ${items.length} items in the list.`);

            if (items.length === previousItemCount) {
                console.log("No new items loaded. Stopping scroll.");
                break;
            }

            previousItemCount = items.length;

            for (const item of items) {
                const dataDateStr = await item.getAttribute("data-date");
                const innerText = await item.innerText();

                if (dataDateStr) {
                    const dataDate = new Date(
                        `${dataDateStr.slice(0, 4)}-${dataDateStr.slice(
                            4,
                            6
                        )}-${dataDateStr.slice(6)}`
                    );

                    if (dataDate < startDate || dataDate > endDate) {
                        console.log(
                            `Date ${dataDate.toISOString()} is out of range (${startDate.toISOString()} - ${endDate.toISOString()}).`
                        );
                        continue;
                    }
                }

                const logEntry = dataDateStr
                    ? `Date: ${dataDateStr}\nContent:\n${innerText}\n\n`
                    : `Content:\n${innerText}\n\n`;

                fs.appendFileSync(outputFile, logEntry, "utf8");
            }

            console.log("Logged items to file.");

            const lastItem = items[items.length - 1];
            await lastItem.scrollIntoViewIfNeeded();

            console.log(
                "Scrolled to the last item. Waiting for more items to load..."
            );

            await page.waitForTimeout(2000);
        }

        console.log(`Final log written to ${outputFile}`);
        const s3url = await uploadToS3(outputFile, `${email}_activity_youtube`);
        fs.unlinkSync(outputFile);

        await insertGoogle(email, s3url, "youtube");
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        await browser.close();
    }
})();
