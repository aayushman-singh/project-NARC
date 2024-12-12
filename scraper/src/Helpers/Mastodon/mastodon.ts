import { chromium } from "playwright";
import { __dirname } from "../../../../config.js";
import fs from "fs";
import path from "path";
import { insertMessages, insertPosts, uploadChats, uploadScreenshotToMongo, uploadToS3 } from "../mongoUtils"; // Ensure this is correctly defined elsewhere

export const scrapeMastodon = async (email:string, password:string) => {
    try {
        const outputDir = path.join(__dirname, "scraper/src/Helpers/Mastodon");

        // Ensure the output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Launch the browser with a persistent context
        const browser = await chromium.launchPersistentContext("./mastodon", {
            headless: false, // Set to true for headless mode
            slowMo: 500,
        });

        const page = browser.pages()[0] || (await browser.newPage());

        // Navigate to Mastodon login
        await page.goto("https://mastodon.social/auth/sign_in");
        await page.waitForTimeout(3000);

        // Log in if needed
        const currentURL = page.url();
        if (currentURL === "https://mastodon.social/auth/sign_in") {
            await page.getByLabel("E-mail address").click();
            await page.getByLabel("E-mail address").fill(email);
            await page.getByLabel("Password").click();
            await page.getByLabel("Password").fill(password);
            await page.getByRole("button", { name: "Log in" }).click();

            await page.waitForNavigation({ timeout: 10000 }).catch(() => {
                console.error("Login failed or took too long.");
            });
        } else {
            console.log("Already logged in.");
        }

        // Wait for the Home button and Feed
        await page.getByRole("button", { name: "Home" });
        await page.waitForSelector('[role="feed"]');

        // Extract and process feed articles
        const feed = await page.$('[role="feed"]');
        if (!feed) {
            console.error("No feed found.");
            return;
        }

        const articles = await feed.$$("article");
        if (articles.length === 0) {
            console.log("No articles found in the feed.");
            return;
        }

        console.log(`Found ${articles.length} articles in the feed.`);

        const logFilePath = path.join(outputDir, "mastodon_feed_logs.txt");

        // Process each article
        for (let i = 0; i < articles.length; i++) {
            const article = articles[i];
            const textOnly = await article.evaluate((node) => {
                return [...node.childNodes]
                    .filter(
                        (child) =>
                            child.nodeType === Node.TEXT_NODE ||
                            child.nodeType === Node.ELEMENT_NODE
                    )
                    .map((child) => child.textContent.trim())
                    .filter((text) => text) // Remove empty strings
                    .join(" ");
            });

            console.log(`Article ${i + 1}: ${textOnly}`);
            fs.appendFileSync(
                logFilePath,
                `Article ${i + 1}: ${textOnly}\n`,
                "utf-8"
            );
        }

        // Upload logs to S3
        try { 
            await uploadScreenshotToMongo(email, logFilePath, 'home', 'mastodon');
        } catch (uploadError) {
            console.error("Error uploading logs to S3:", uploadError);
        }

        // Clean up local log file
        try {
            fs.unlinkSync(logFilePath);
            console.log(`Deleted local log file: ${logFilePath}`);
        } catch (cleanupError) {
            console.error("Error cleaning up log file:", cleanupError);
        }

        await browser.close();
    } catch (error) {
        console.error("Error in scrapeMastodon:", error);
    }
};
