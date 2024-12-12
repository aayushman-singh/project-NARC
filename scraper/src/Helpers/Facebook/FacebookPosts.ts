import { Page } from "playwright";
import fs from "fs";
import path from "path";
import { uploadScreenshotToMongo } from "../mongoUtils";
import { fileURLToPath } from "url";
import { dirname } from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export async function scrapeFacebookPosts(
    username: string,
    page: Page,
    limit: number
) {
    try {
        let resultId;
        const xpath =
            "/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div/div/div[4]/div[2]/div/div[2]/div[3]";

        console.log("Waiting for the posts container...");
        await page.waitForSelector("xpath=" + xpath, { timeout: 15000 });
        console.log("Posts container selector is available.");

        const postsContainer = await page.$("xpath=" + xpath);

        if (postsContainer) {
            console.log("Posts container found.");

            // Get all direct child divs representing posts
            const postDivs = await page.evaluate((container) => {
                return Array.from(container.children).map(
                    (_, index) => index + 1
                );
            }, postsContainer);

            if (postDivs.length > 0) {
                console.log(`Found ${postDivs.length} post(s).`);
                for (let i = 0; i < Math.min(limit, postDivs.length); i++) {
                    try {
                        const postXPath = `${xpath}/div[${postDivs[i]}]`;
                        const postElement = await page.$("xpath=" + postXPath);

                        if (postElement) {
                            console.log(`Processing post ${i + 1}...`);

                            // Scroll to the post and wait for it to load
                            await page.evaluate(
                                (el) => el.scrollIntoView(),
                                postElement
                            );
                            await page.waitForTimeout(500); // Wait for smooth scrolling and rendering

                            // Take a screenshot of the post
                            const screenshotPath = path.join(
                                __dirname,
                                `post_${i + 1}.png`
                            );
                            await postElement.screenshot({
                                path: screenshotPath,
                            });
                            console.log(`Screenshot for post ${i + 1} taken.`);
                            
                            // Upload the screenshot to MongoDB
                            resultId = await uploadScreenshotToMongo(
                                username,
                                screenshotPath,
                                `post_${i + 1}.png`,
                                "facebook"
                            );
                            console.log(
                                `Screenshot for post ${
                                    i + 1
                                } uploaded to MongoDB.`
                            );

                            // Delete the screenshot file after uploading if needed
                            fs.unlinkSync(screenshotPath);
                            console.log(
                                `Local screenshot for post ${i + 1} deleted.`
                            );
                        } else {
                            console.warn(`Post ${i + 1} not found.`);
                        }
                        
                    } catch (error) {
                        console.error(`Error processing post ${i + 1}:`, error);
                    }
                }
            } else {
                console.warn("No posts found within the container.");
            }
        } else {
            console.warn("Posts container not found.");
        }
        return resultId;
    } catch (error) {
        console.error(
            "An error occurred while scraping Facebook posts:",
            error
        );

        // Take a full-page screenshot for debugging if posts container isn't found
        try {
            const debugScreenshotPath = path.join(
                __dirname,
                "debug_no_container.png"
            );
            await page.screenshot({
                path: debugScreenshotPath,
                fullPage: true,
            });
            console.log(`Debug screenshot saved to: ${debugScreenshotPath}`);
        } catch (screenshotError) {
            console.error(
                "Failed to capture debug screenshot:",
                screenshotError
            );
        }
    }
}
