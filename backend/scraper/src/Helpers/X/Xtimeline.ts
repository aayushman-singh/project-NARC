import { BrowserContext, chromium, Page } from "playwright";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import {
    insertFollowers,
    insertFollowing,
    uploadScreenshotToMongo,
} from "../mongoUtils.js";
import fs from "fs"; 
import path from 'path';
import { fileURLToPath } from "url";
import { dirname } from "path";
import { scrapeXMessages } from "./Xmessages.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use the stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

// Random delay between actions to mimic human behavior
function randomDelay(min: number, max: number) {
    return new Promise((resolve) =>
        setTimeout(resolve, Math.random() * (max - min) + min),
    );
}

export async function scrapeX(EMAIL: string, PASSWORD: string) {
    let context: BrowserContext | null = null;
    try {
        // Launch the persistent context
        context = await chromium.launchPersistentContext("./x_context", {
            headless: false,
            slowMo: 2000,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        // Get the active page
        const pages = context.pages();
        const page: Page =
            pages.length > 0 ? pages[0] : await context.newPage();

        await page.goto("https://x.com/", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(2000);

        // Check if the user is already logged in
        const isLoggedIn =
            (await page.$('div[aria-label="Home timeline"]')) !== null;

        if (isLoggedIn) {
            console.log("Session found. User is already logged in.");
        } else {
            console.log("No active session found. Proceeding to login...");

            // Navigate to the login page
            await page.goto("https://x.com/i/flow/login", {
                waitUntil: "networkidle",
            });

            // Enter the username
            await page.waitForSelector('input[name="text"]', {
                timeout: 30000,
            });
            await page.fill('input[name="text"]', EMAIL);
            console.log("Entered username.");

            // Click the "Next" button
            await page.waitForSelector('button:has-text("Next")', {
                timeout: 30000,
            });
            await page.click('button:has-text("Next")');
            console.log("Clicked next button.");

            // Enter the password
            await page.waitForSelector('input[name="password"]', {
                timeout: 60000,
            });
            await page.fill('input[name="password"]', PASSWORD);
            console.log("Entered password.");

            // Click the "Log in" button
            await page.waitForSelector(
                'button[data-testid="LoginForm_Login_Button"]',
                { timeout: 30000 }
            );
            await page.click('button[data-testid="LoginForm_Login_Button"]');
            console.log("Clicked login button.");
            await page.waitForSelector('a[aria-label="Home"]', {
                timeout: 60000,
            });
            console.log("Login successful.");
        }

        // Navigate to the followers page
        await page.goto("https://x.com/followers", {
            waitUntil: "networkidle",
        });
        await page.waitForTimeout(2000);

        // Extract the username from the URL
        const currentUrl = page.url();
        const USERNAME =
            currentUrl.match(/https:\/\/x\.com\/([^/]+)\/followers/)?.[1] || "";

        if (USERNAME) {
            console.log("Extracted username:", USERNAME);
        } else {
            console.log("Username could not be extracted.");
        }

        // Visit user profile
        const profileUrl = `https://x.com/${USERNAME}`;
        await page.goto(profileUrl);
        console.log(`Navigated to profile: ${profileUrl}`);

        // Take a screenshot of the user profile
        await randomDelay(2000, 4000); // Random delay between 2-4 seconds
        await page.screenshot({
            path: `${USERNAME}_profile.png`,
            fullPage: false,
        });
        console.log("Took profile screenshot.");

        await page.goto("https://x.com/", { timeout: 4000 });
        // Scroll through the timeline and take screenshots
        for (let i = 1; i <= 3; i++) {
            await page.waitForTimeout(2000);
            await page.screenshot({
                path: `timeline_screenshot${i}.png`,
                fullPage: false,
            });
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            await uploadScreenshotToMongo(
                USERNAME,
                `timeline_screenshot${i}.png`,
                "timeline",
                "twitter"
            );
        }

        console.log(
            "Timeline scraping completed. Now navigating to profile, followers, and following pages."
        );

        const scrapeList = async (
            page: any,
            listType: string,
            selector: string,
            logFilePath: string,
            username: string,

            insertMethod: Function
        ) => {
            console.log(`Starting to scrape ${listType} for ${username}...`);

            try {
                await page.goto(`https://x.com/${username}${selector}`);

                await page.waitForTimeout(5000);
                console.log(`Navigated to ${listType} page.`);

                let scrollAttempts = 0;
                const maxScrollAttempts = 15;
                const dataSet: {
                    username: string | null;
                    profilePic: string | null;
                }[] = [];

                while (scrollAttempts < maxScrollAttempts) {
                    // Scrape data
                    const data = await page.evaluate(() => {
                        const userCells = document.querySelectorAll(
                            'button[data-testid="UserCell"]'
                        );
                        const scrapedData = [];
                        userCells.forEach((button) => {
                            try {
                                const profileLink =
                                    button.querySelector('a[href^="/"]');
                                const username = profileLink
                                    ?.getAttribute("href")
                                    ?.replace("/", "");
                                const profilePic = button
                                    .querySelector("img")
                                    ?.getAttribute("src");
                                if (username && profilePic) {
                                    scrapedData.push({ username, profilePic });
                                }
                            } catch (error: any) {
                                console.error(
                                    `Error processing a button: ${error.message}`
                                );
                            }
                        });
                        return scrapedData;
                    });

                    // Add unique entries and stop if max limit is reached
                    let newItemsAdded = false;
                    for (const item of data) {
                        if (
                            !dataSet.some(
                                (existing) =>
                                    existing.username === item.username
                            )
                        ) {
                            dataSet.push(item);
                            newItemsAdded = true;
                            console.log(
                                `${listType}: Username: ${item.username}, Profile Pic: ${item.profilePic}`
                            );
                        }
                    }

                    // Scroll down
                    await page.evaluate(() =>
                        window.scrollBy(0, window.innerHeight)
                    );
                    console.log(`Scrolled down ${listType} page.`);

                    // Wait for content to load
                    await new Promise((resolve) => setTimeout(resolve, 3000));

                    if (!newItemsAdded) {
                        scrollAttempts++;
                        console.log(
                            `No new ${listType} loaded. Scroll attempt: ${scrollAttempts}`
                        );
                    } else {
                        scrollAttempts = 0; // Reset scroll attempts if new items are added
                    }

                    if (scrollAttempts >= 3) {
                        console.log(
                            `No new ${listType} after several attempts. Stopping scroll.`
                        );
                        break;
                    }
                }

                // Save to log file
                const logData = dataSet
                    .map(
                        (item) =>
                            `Username: ${item.username}, Profile Pic: ${item.profilePic}`
                    )
                    .join("\n");
                await fs.writeFile(logFilePath, logData, (err) => {
                    if (err) console.log(err);
                });
                console.log(`Total ${listType} extracted and logged.`);

                // Upload data to MongoDB
                await insertMethod(username, dataSet, "twitter");
                console.log(
                    `${listType} data uploaded to MongoDB successfully.`
                );
            } catch (error) {
                console.error(
                    `Error scraping ${listType} for ${username}:`,
                    error
                );
            }
        };

        const scrapeXProfile = async (page: any, username: string) => {
            console.log(`Starting scraping for user: ${username}`);

            // Scrape followers
            await scrapeList(
                page,
                "followers",
                "/followers",
                `./${username}_followers_log.txt`,
                username,

                insertFollowers
            );

            // Scrape following
            await scrapeList(
                page,
                "following",
                "/following",
                `./${username}_following_log.txt`,
                username,

                insertFollowing
            );

            console.log(
                `Completed scraping followers and following for user: ${username}`
            );
        };
        await scrapeXProfile(page, USERNAME);

        await page.goto(`https://x.com/${USERNAME}`);
        const screenshotPath = "profile_page.png";
        await page.screenshot({ path: screenshotPath, fullPage: true });
        await uploadScreenshotToMongo(
            USERNAME,
            screenshotPath,
            "profile_page",
            "facebook"
        );

        fs.unlinkSync(screenshotPath);

        await page.goto("https://x.com/messages");
        // Wait for user tiles to load on the page
        await scrapeXMessages(page, USERNAME, "twitter");
    } catch (error) {
        console.error("Error during scraping:", error);
    } finally {
        if (context) {
            await context.close();
        }
    }
}
