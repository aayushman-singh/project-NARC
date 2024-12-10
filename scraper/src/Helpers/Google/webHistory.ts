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

// Parse the date range
const [startDateStr, endDateStr] = range.split(" to ");
const startDate = new Date(startDateStr.split("-").reverse().join("-"));
const endDate = new Date(endDateStr.split("-").reverse().join("-"));

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
        const s3url = await uploadToS3(outputFile, `${email}_activity_google`);
        fs.unlinkSync(outputFile);
        
        await insertGoogle(email, s3url, "google");
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        await browser.close();
    }
})();
