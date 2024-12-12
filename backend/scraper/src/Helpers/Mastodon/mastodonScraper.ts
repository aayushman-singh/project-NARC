import { chromium, Browser, BrowserContext, Page } from "playwright";
import { __dirname } from "../../../../../config.js";
import fs from "fs";
import path from "path";
import { updateUserHistory, uploadMastodon, uploadScreenshotToMongo } from "../mongoUtils.js";

interface ScrapingResult {
    success: boolean;
    message: string;
    articlesCount?: number;
    username?: string;
    error?: string;
}

export const scrapeMastodon = async (
    email: string,
    password: string,
    userId: string
): Promise<ScrapingResult> => {
    let browser: BrowserContext | null = null;
    let page: Page | null = null;
    const outputDir = path.join(__dirname, "scraper/src/Helpers/Mastodon");
    const logFilePath = path.join(
        outputDir,
        `${email.replace(/[^a-zA-Z0-9]/g, "_")}_mastodon_feed.txt`
    );
    

    // Profile info extraction function
    async function extractProfileInfo(page: Page): Promise<ProfileInfo> {
        const profileInfo = await page.evaluate(() => {
            const tabsNameDiv = document.querySelector(
                ".account__header__tabs__name"
            );
            if (!tabsNameDiv) {
                throw new Error("Profile tabs name div not found");
            }

            const fullNameSpan = tabsNameDiv.querySelector("span");
            const serverPill = tabsNameDiv.querySelector(
                ".account__domain-pill"
            );

            return {
                fullName: fullNameSpan?.textContent?.trim() || "Unknown",
                server: serverPill?.textContent?.trim() || "Unknown",
                username: window.location.pathname.split("@")[1] || "Unknown",
            };
        });

        return profileInfo;
    }

    try {
        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Initialize log file
        fs.writeFileSync(
            logFilePath,
            `=== Mastodon Feed Scraping Started: ${new Date().toISOString()} ===\n\n`
        );

        console.log("Launching browser...");
        browser = await chromium.launchPersistentContext("./mastodon", {
            headless: false,
            slowMo: 500,
            viewport: { width: 1280, height: 720 },
            userAgent:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        });

        page = browser.pages()[0] || (await browser.newPage());

        // Configure timeouts
        await page.setDefaultTimeout(30000);
        await page.setDefaultNavigationTimeout(30000);

        console.log("Navigating to Mastodon login page...");
        await page.goto("https://mastodon.social/auth/sign_in", {
            waitUntil: "networkidle",
        });

        // Check if login is needed
        const currentURL = page.url();
        if (currentURL.includes("/auth/sign_in")) {
            console.log("Logging in...");
            try {
                await page.getByLabel("E-mail address").fill(email);
                await page.getByLabel("Password").fill(password);
                await Promise.all([
                    page.waitForNavigation({ timeout: 10000 }),
                    page.getByRole("button", { name: "Log in" }).click(),
                ]);
            } catch (loginError) {
                throw new Error(`Login failed: ${loginError.message}`);
            }
        } else {
            console.log("Already logged in");
        }

        // Wait for feed to load
        console.log("Waiting for feed to load...");
        await Promise.all([
            page.waitForSelector('[role="feed"]', { state: "attached" }),
            page.getByRole("button", { name: "Home" }).waitFor(),
        ]);

        // Take multiple screenshots of the feed while scrolling
        for (let i = 1; i <= 3; i++) {
            console.log(`Taking screenshot ${i} of 3...`);

            // Take screenshot
            const screenshotPath = path.join(
                outputDir,
                `${email.replace(/[^a-zA-Z0-9]/g, "_")}_feed_${i}.png`
            );
            await page.screenshot({
                path: screenshotPath,
                fullPage: true,
            });

            // Upload screenshot to MongoDB
            const resultId = await uploadScreenshotToMongo(
                email,
                screenshotPath,
                `feed_${i}`,
                "mastodon"
            );
            await updateUserHistory(userId, email, resultId, "mastodon");

            // Scroll down for next screenshot (if not the last iteration)
            if (i < 3) {
                await page.evaluate(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                });
                // Wait for new content to load
                await page.waitForTimeout(2000);
            }
        }

        // Extract feed content
        console.log("Extracting feed content...");
        const feed = await page.$('[role="feed"]');
        if (!feed) {
            throw new Error("Feed not found");
        }

        const articles = await feed.$$("article");
        if (articles.length === 0) {
            throw new Error("No articles found in feed");
        }

        console.log(`Processing ${articles.length} articles...`);

        // Process articles
        for (const [index, article] of articles.entries()) {
            try {
                const articleData = await article.evaluate((node) => {
                    const author =
                        node
                            .querySelector(".display-name__html")
                            ?.textContent?.trim() || "Unknown Author";
                    const timestamp =
                        node.querySelector("time")?.getAttribute("datetime") ||
                        "No timestamp";
                    const content =
                        node
                            .querySelector(".status__content")
                            ?.textContent?.trim() || "No content";
                    const mediaCount = node.querySelectorAll(
                        ".media-gallery__item"
                    ).length;

                    return {
                        author,
                        timestamp,
                        content,
                        mediaCount,
                    };
                });

                const logEntry = `
Article ${index + 1}:
Author: ${articleData.author}
Time: ${articleData.timestamp}
Content: ${articleData.content}
Media Items: ${articleData.mediaCount}
------------------------
`;
                fs.appendFileSync(logFilePath, logEntry);
            } catch (articleError) {
                console.error(
                    `Error processing article ${index + 1}:`,
                    articleError
                );
                fs.appendFileSync(
                    logFilePath,
                    `Error processing article ${index + 1}: ${
                        articleError.message
                    }\n`
                );
            }
        }

        // Click on account display name and wait for navigation
        console.log("Navigating to profile page...");
        await Promise.all([
            page.waitForNavigation(),
            page.click(".account__display-name"),
        ]);

        // Extract username from URL
        const profileUrl = page.url();
        const username = profileUrl.split("@")[1] || "unknown";
        console.log(`Extracted username: @${username}`);

        // Log username
        fs.appendFileSync(logFilePath, `\nProfile Username: @${username}\n`);

        const profileScreenshotPath = path.join(
            outputDir,
            `${email.replace(/[^a-zA-Z0-9]/g, "_")}_profile.png`
        );
        await page.screenshot({
            path: profileScreenshotPath,
            fullPage: true,
        });

        // Upload profile screenshot to MongoDB
        const profileResultId = await uploadScreenshotToMongo(
            email,
            profileScreenshotPath,
            "profile",
            "mastodon"
        );
        await updateUserHistory(
            userId,
            email,
            profileResultId,
            "mastodon-profile"
        );

         console.log("Extracting profile picture...");
         const profilePicElement = await page.$(".account__header__bar a img");

         if (profilePicElement) {
             const profilePicUrl = await profilePicElement.getAttribute("src");

             if (profilePicUrl) {
                 const imagePage = await browser.newPage();
                 try {
                     await imagePage.goto(profilePicUrl);

                     const profilePicPath = path.join(
                         outputDir,
                         `${email.replace(
                             /[^a-zA-Z0-9]/g,
                             "_"
                         )}_profile_pic.png`
                     );

                     await imagePage.screenshot({
                         path: profilePicPath,
                         fullPage: false,
                     });

                     const profilePicResultId = await uploadScreenshotToMongo(
                         email,
                         profilePicPath,
                         "profile_pic",
                         "mastodon"
                     );
                     await updateUserHistory(
                         userId,
                         email,
                         profilePicResultId,
                         "mastodon-profile-pic"
                     );

                     console.log(
                         "Profile picture saved and uploaded successfully"
                     );
                 } catch (imageError) {
                     console.error("Error saving profile picture:", imageError);
                     fs.appendFileSync(
                         logFilePath,
                         `\nError saving profile picture: ${imageError.message}\n`
                     );
                 } finally {
                     await imagePage.close();
                 }
             }

             // Extract profile information
             console.log("Extracting profile information...");
             try {
                 const profileInfo = await extractProfileInfo(page);

                 fs.appendFileSync(
                     logFilePath,
                     `\nProfile Information:
Full Name: ${profileInfo.fullName}
Server: ${profileInfo.server}
Username: ${profileInfo.username}\n`
                 );

                 const profileInfoId = await uploadMastodon(
                     email,
                     profileInfo,
                     userId,
                     'mastodon'
                 );
                 await updateUserHistory(
                     userId,
                     email,
                     profileInfoId,
                     "mastodon-profile-info"
                 );

                 return {
                     success: true,
                     message:
                         "Feed, profile, profile picture, and information scraped successfully",
                     articlesCount: articles.length,
                     username: `@${profileInfo.username}`,
                     profileInfo,
                 };
             } catch (profileInfoError) {
                 console.error(
                     "Error extracting profile information:",
                     profileInfoError
                 );
                 fs.appendFileSync(
                     logFilePath,
                     `\nError extracting profile information: ${profileInfoError.message}\n`
                 );
             }
         }

        // Clean up
        fs.appendFileSync(
            logFilePath,
            `\n=== Scraping Completed: ${new Date().toISOString()} ===\n`
        );
        console.log("Scraping completed successfully");

        return {
            success: true,
            message: "Feed, profile, and profile picture scraped successfully",
            articlesCount: articles.length,
            username: `@${username}`,
        };
    } catch (error) {
        const errorMessage = `Scraping failed: ${error.message}`;
        console.error(errorMessage);
        fs.appendFileSync(logFilePath, `\nERROR: ${errorMessage}\n`);

        return {
            success: false,
            message: "Scraping failed",
            error: error.message,
        };
    } finally {
        if (page) {
            try {
                // Upload final logs before closing
                const logResultId = await uploadScreenshotToMongo(
                    email,
                    logFilePath,
                    "logs",
                    "mastodon"
                );
                await updateUserHistory(
                    userId,
                    email,
                    logResultId,
                    "mastodon-logs"
                );
            } catch (uploadError) {
                console.error("Error uploading logs:", uploadError);
            }
        }

        if (browser) {
            await browser.close().catch(console.error);
        }
    }
};