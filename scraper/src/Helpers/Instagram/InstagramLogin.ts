import { Page } from "playwright";
import fs from "fs/promises";
import { uploadScreenshotToMongo, insertMessages } from "../mongoUtils";
import path from "path";
import { __dirname } from "../../../../config";
/**
 * Scrape Instagram login activity, scroll to elements using XPath, capture screenshots for every 3rd item,
 * log all elements to a text file, and upload screenshots to MongoDB.
 *
 * @param username - The username for identifying the session
 * @param page - Playwright page instance
 */
export async function scrapeInstagramLogin(
    username: string,
    page: Page
): Promise<void> {
    try {
        console.log("Starting scraping...");

        // Define the XPath for the items
        const baseXPath =
            "/html/body/div[2]/div/div/div[2]/div/div/div[1]/div[1]/div[1]/section/main/div/div[3]/div/div/div[2]/div[2]/div/div";

        let index = 1;
        let element;
        let loggedContent = "";
        let scrollCount = 0;

        while (true) {
            // Construct the full XPath for the current element
            const fullXPath = `${baseXPath}[${index}]`;

            // Locate the element using XPath
            element = await page.$(`xpath=${fullXPath}`);
            if (!element) {
                console.log(`No more items found at index ${index}.`);
                break; // Exit the loop when no more elements are found
            }

            // Scroll to the element
            await element.scrollIntoViewIfNeeded();
            console.log(`Scrolled to item ${index}`);

            // Get the text content of the element
            const textContent = await element.textContent();
            const trimmedText = textContent
                ? textContent.trim()
                : "No text content";

            // Log the element's text content
            console.log(`Item ${index} text content: ${trimmedText}`);
            loggedContent += `Item ${index}: ${trimmedText}\n`;

            // Capture and upload a screenshot for every third item
            if (index % 3 === 0) {
                const screenshotPath = `screenshot_item_${index}.png`;
                await element.screenshot({ path: screenshotPath });
                console.log(`Captured screenshot for item ${index}`);

                // Upload screenshot to MongoDB
                await uploadScreenshotToMongo(
                    username,
                    screenshotPath,
                    `item_${index/3}`,
                    "instagram"
                );
                console.log(`Uploaded screenshot for item ${index}`);
            }

            index++;
            scrollCount++;
        }

       try {
           const logDir = path.join(
               __dirname,
               "scraper/src/Helpers/Instagram/logs"
           );
           const outputFileName = path.join(logDir, "logged_elements.txt");

           // Ensure the directory exists
           await fs.mkdir(logDir, { recursive: true });

           // Write the logged content to the file
           await fs.writeFile(outputFileName, loggedContent, "utf-8");
           console.log(`Logged content written to ${outputFileName}`);
           console.log(`Finished scrolling through ${scrollCount} items.`);

           // Upload the file to MongoDB
           await insertMessages(username, outputFileName, "instagram");
           console.log(`Uploaded logged content for ${username} to MongoDB.`);

           // Delete the file after upload
           await setTimeout( ()=>
               fs.unlink(outputFileName), 3000);
           console.log(`Deleted log file: ${outputFileName}`); 
       } catch (error) {
           console.error("Error handling logged content:", error.message);
           console.error(error.stack);
       }
    } catch (error) {
        console.error("Error during Instagram scraping with uploads:", error);
    }
}
