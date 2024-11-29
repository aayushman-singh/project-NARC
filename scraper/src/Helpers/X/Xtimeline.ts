import { BrowserContext, chromium, Page } from "playwright";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import {
    insertFollowers,
    insertFollowing,
    uploadScreenshotToMongo,
} from "../mongoUtils";
import fs from "fs"; 
import path from 'path';
import { fileURLToPath } from "url";
import { dirname } from "path";

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

        // Check if session is already active
        const pages = context.pages();
        const page: Page =
            pages.length > 0 ? pages[0] : await context.newPage();

        await page.goto("https://x.com/", { waitUntil: "networkidle" });

        // Check if the user is already logged in by looking for a logged-in element
        const isLoggedIn = await page
            .locator('a[aria-label="Profile"], a[aria-label="Home"]')
            .count();

        if (isLoggedIn > 0) {
            console.log("Session found. User is already logged in.");
            return;
        }

        console.log("No active session found. Proceeding to login...");

        // Navigate to the login page
        await page.goto("https://x.com/i/flow/login", {
            waitUntil: "networkidle",
        });

        // Wait for the username input to appear and enter the username
        await page.waitForSelector('input[name="text"]', { timeout: 30000 });
        await page.fill('input[name="text"]', EMAIL);
        console.log("Entered username.");

        // Wait for the "Next" button to be visible and click it
        await page.waitForSelector('button[role="button"]:has-text("Next")', {
            timeout: 30000,
        });
        await page.click('button[role="button"]:has-text("Next")');
        console.log("Clicked next button after username.");

        // Wait for the password input to appear
        await page.waitForSelector('input[name="password"]', {
            timeout: 60000,
        });
        await page.fill('input[name="password"]', PASSWORD);
        console.log("Entered password.");

        // Wait for the "Log in" button to appear and click it
        await page.waitForSelector(
            'button[data-testid="LoginForm_Login_Button"]',
            { timeout: 30000 }
        );
        await page.click('button[data-testid="LoginForm_Login_Button"]');
        console.log("Clicked login button after password.");

        // Wait for the home page to load as a confirmation of successful login
        await page.waitForSelector('a[aria-label="Home"]', { timeout: 60000 });
        console.log("Login successful. Session is now active.");
        // Wait for the element after login to confirm successful navigation
        await page.waitForSelector(
            "#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > main > div",
            { timeout: 30000 }
        );
        console.log("Successfully logged in and main page loaded.");
        await page.waitForTimeout(7000);
        await page.goto("https://x.com/followers", {
            waitUntil: "networkidle",
        });

        // Wait for the URL to change to include '/followers'
        await page.waitForFunction(
            () =>
                window.location.href.match(
                    /https:\/\/x\.com\/[^/]+\/followers/
                ),
            { timeout: 10000 } // Adjust timeout as needed
        );

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
                            } catch (error) {
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
        await page.waitForSelector('[data-testid="conversation"]');

        // Select user tiles and interact with them
        const userTiles = await page.$$('div[data-testid="conversation"]');

        if (userTiles.length > 0) {
            console.log(`Found ${userTiles.length} user tile(s).`);

            for (let i = 0; i < userTiles.length; i++) {
                // Click on each user tile one at a time
                await userTiles[i].click();
                console.log(`Simulated click on user tile ${i + 1}.`);

                // Wait for the messages container to load (adjust timeout as necessary)
                await page.waitForTimeout(5000);

                // Extract the display name and handle from each user tile
                const { displayName, handle } = await page.evaluate((tile) => {
                    const nameElement = tile.querySelector(
                        "div > div > div > div > div > div > div > span"
                    );
                    const username = nameElement
                        ? nameElement.textContent.trim()
                        : `user_${i + 1}`;

                    const handleXPath = ".//div/div[2]/div/div/div/span";
                    const handleElement = document.evaluate(
                        handleXPath,
                        tile,
                        null,
                        XPathResult.FIRST_ORDERED_NODE_TYPE,
                        null
                    ).singleNodeValue as HTMLElement;
                    const userHandle = handleElement
                        ? handleElement.textContent.trim()
                        : `handle_${i + 1}`;

                    return { displayName: username, handle: userHandle };
                }, userTiles[i]);

                // Create a formatted file name for the screenshot
                const sanitizedHandle = handle.replace(/[^a-zA-Z0-9_]/g, "");
                const sanitizedDisplayName = displayName.replace(
                    /[^a-zA-Z0-9_]/g,
                    ""
                );
                const screenshotPath = path.join(
                    __dirname,
                    `${sanitizedDisplayName}_${sanitizedHandle}_messages.png`
                );

                // Take a screenshot of the messages and save it with the new filename
                await page.screenshot({ path: screenshotPath, fullPage: true });
                console.log(
                    `Screenshot for user tile ${
                        i + 1
                    } taken as ${screenshotPath}.`
                );

                // Use a function to upload the screenshot to MongoDB (this function needs to be defined elsewhere)
                await uploadScreenshotToMongo(
                    sanitizedDisplayName,
                    screenshotPath,
                    "message",
                    "twitter"
                );
                console.log(
                    `Screenshot for user ${sanitizedDisplayName} uploaded to MongoDB.`
                );

                // Optionally, delete the local screenshot file after uploading
                fs.unlinkSync(screenshotPath);
            }
        } else {
            console.log("No user tiles found.");
        }
    } catch (error) {
        console.error("Error during scraping:", error);
    } finally {
        if (context) {
            await context.close();
        }
    }
}
