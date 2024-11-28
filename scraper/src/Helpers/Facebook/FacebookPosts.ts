import { Page } from "playwright";
import fs from "fs";
import path from "path";
import { uploadToS3 } from "../mongoUtils";

export async function scrapeFacebookPosts(
    page: Page,
    postsContainerXPath: string,
    limit: number
) {
    try {
        // Locate the posts container using XPath
        const postsContainer = await page.$("xpath=" + postsContainerXPath);

        if (!postsContainer) {
            console.error("Posts container not found.");
            return [];
        }

        console.log("Posts container found.");

        // Scroll to load all posts
        let previousHeight = 0;
        let currentHeight = await page.evaluate((xpath) => {
            const container = document.evaluate(
                xpath,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue as HTMLElement;
            return container.scrollHeight;
        }, postsContainerXPath);

        console.log("Starting to load all posts...");
        while (currentHeight !== previousHeight) {
            previousHeight = currentHeight;

            // Scroll to the bottom of the container
            await page.evaluate((xpath) => {
                const container = document.evaluate(
                    xpath,
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue as HTMLElement;
                container.scrollTo(0, container.scrollHeight);
            }, postsContainerXPath);

            // Wait for new content to load
            await page.waitForTimeout(1000);

            // Check the updated container height
            currentHeight = await page.evaluate((xpath) => {
                const container = document.evaluate(
                    xpath,
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue as HTMLElement;
                return container.scrollHeight;
            }, postsContainerXPath);

            console.log(`Scrolled to bottom. Current height: ${currentHeight}`);
        }

        console.log("All posts loaded.");

        // Get all direct child divs representing posts
        const postDivs = await page.evaluate((xpath) => {
            const container = document.evaluate(
                xpath,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue as HTMLElement;
            return Array.from(container.children).map((_, index) => index + 1);
        }, postsContainerXPath);

        if (postDivs.length > 0) {
            console.log(`Found ${postDivs.length} post(s).`);

            const scrapedPosts = [];

            for (let i = 0; i < Math.min(limit, postDivs.length); i++) {
                const postXPath = `${postsContainerXPath}/div[${postDivs[i]}]`;
                const postElement = await page.$("xpath=" + postXPath);

                if (postElement) {
                    try {
                        // Scroll to the post and wait for it to load
                        await page.evaluate((el) => el.scrollIntoView(), postElement);
                        await page.waitForTimeout(500); // Wait for smooth scrolling and rendering

                        // Take a screenshot of the post
                        const screenshotPath = path.resolve(
                            './screenshots',
                            `post_${i + 1}.png`
                        );
                        await postElement.screenshot({ path: screenshotPath });
                        console.log(`Screenshot for post ${i + 1} taken.`);

                        const s3Key = `post_${i + 1}`;
                        const s3Url = await uploadToS3(screenshotPath, s3Key);

                        // Add the post data to the scrapedPosts array
                        scrapedPosts.push({
                            s3Url, // Path to the screenshot
                            timestamp: new Date().toISOString(), // Add a timestamp for the post
                            postIndex: i + 1, // Add an index or any other metadata
                        });

                        // Optionally, remove the screenshot file after processing
                        await fs.promises.unlink(screenshotPath);
                    } catch (error) {
                        console.error(`Error processing post ${i + 1}:`, error);
                    }
                } else {
                    console.log(`Post ${i + 1} not found.`);
                }
            }

            return scrapedPosts;
        } else {
            console.log("No posts found.");
            return [];
        }
    } catch (error) {
        console.error("An error occurred while loading and scraping posts:", error);
        return [];
    }
}
