import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { __dirname } from "../../../../config.ts";
import { insertGoogle, uploadToS3 } from "../mongoUtils.ts";

const outputFile = path.join(__dirname, "/scraper/src/Helpers/Google/log.txt");
const configFilePath = path.join(
    __dirname,
    "/scraper/src/Helpers/Google/gconfig.json"
);

// Read configuration
const { email, range } = JSON.parse(fs.readFileSync(configFilePath, "utf-8"));

// Validate and parse the date range
if (!range || !range.from || !range.to) {
    throw new Error("Invalid date range provided in the config file.");
}

const startDate = new Date(range.from.split("-").reverse().join("-"));
const endDate = new Date(range.to.split("-").reverse().join("-"));

// Ensure startDate and endDate are valid
if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid start or end date. Check the date format in the config file.");
}

console.log("Parsed Start Date:", startDate);
console.log("Parsed End Date:", endDate);

(async () => {
    const browser = await chromium.connectOverCDP("http://localhost:9223");

    try {
        const context = browser.contexts()[0] || (await browser.newContext());
        const page = await context.newPage();

        await page.goto(
            "https://myactivity.google.com/activitycontrols/webandapp?hl=en",
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
        const s3url = await uploadToS3(outputFile, `${email}_activity_google`);
        fs.unlinkSync(outputFile);

        await insertGoogle(email, s3url, "google");
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        await browser.close();
    }
})();
