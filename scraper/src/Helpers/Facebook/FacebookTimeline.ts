import { chromium, BrowserContext, Page } from "playwright";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import {
    insertFollowers,
    insertPosts,
    uploadChats,
    uploadScreenshotToMongo,
    uploadToS3,
} from "../mongoUtils";

import path, { dirname } from "path";
import { scrapeFacebookPosts } from "./FacebookPosts";
import { scrapeFacebookChats } from "./FacebookChats";
import { __dirname } from "../../../../config";
import { scrapeFacebookActivity } from "./FacebookLogin";
// Use the stealth plugin to avoid detection

puppeteer.use(StealthPlugin());

// Random delay between actions to mimic human behavior
function randomDelay(min: number, max: number) {
    return new Promise((resolve) =>
        setTimeout(resolve, Math.random() * (max - min) + min),
    );
}

export async function scrapeFacebook(
    email: string,
    password: string,
    pin: string,
    limit: number,
) {
    let context: BrowserContext | null = null;
    try {
        let resultId;
        // Launch the browser
        context = await chromium.launchPersistentContext("./fb_context",{
            headless: false,
            slowMo: 500,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
    
        const pages = context.pages();
        const page: Page = pages.length > 0 ? pages[0] : await context.newPage();

        // Navigate to Facebook login page
        await page.goto("https://www.facebook.com/", {
            waitUntil: "domcontentloaded", timeout: 60000
        });

       // Check if the user is already logged in
       const isLoggedIn = await page.evaluate(() => {
        // Facebook's homepage shows different elements when logged in
        return !!document.querySelector('[aria-label="Create a post"]'); // Example selector for logged-in user menu
    });

    if (!isLoggedIn) {
        console.log("Not logged in, starting login process.");

        // Wait for the username input and enter the username
        await page.waitForSelector("#email", { timeout: 30000 });
        await page.fill("#email", email);
        console.log("Entered Facebook username.");

        // Wait for the password input and enter the password
        await page.waitForSelector("#pass", { timeout: 30000 });
        await page.fill("#pass", password);
        console.log("Entered Facebook password.");

        // Wait for the login button to be visible and click it
        await page.waitForSelector('button[data-testid="royal_login_button"]', {
            timeout: 30000,
        });
        await page.click('button[data-testid="royal_login_button"]');
        console.log("Clicked Facebook login button.");
        await page.waitForTimeout(40000);
        // Wait for the main screen element to confirm login success
        await page.waitForSelector('[aria-label="Create a post"]', { timeout: 8000 });
        console.log("Successfully logged in.");
    } else {
        console.log("Already logged in, skipping login process.");
    }
        

        await page.goto("https://www.facebook.com/me/", {
            waitUntil: "domcontentloaded", timeout: 60000
        });

        const currentUrl = page.url();
        let username = currentUrl.split(".com/")[1];

        if (username) {
            // Remove the trailing slash if it exists
            username = username.replace(/\/$/, ""); // This removes a trailing slash
            console.log(`Username extracted: ${username}`);
        } else {
            console.log("Username could not be extracted.");
        }

        await page.goto("https://www.facebook.com", {
            waitUntil: "domcontentloaded", timeout: 60000
        });
        // Take at least three screenshots with random delays and scroll
        await (async function () {
            try {
                // Loop to take timeline screenshots
                for (let i = 1; i <= 3; i++) {
                    await randomDelay(2000, 4000); // Random delay between 2-4 seconds
                    const screenshotPath = `facebook_screenshot_${i}.png`;
                    await page.screenshot({ path: screenshotPath, fullPage: false });
                    console.log(`Took screenshot ${i}.`);
        
                    await uploadScreenshotToMongo(
                        username,
                        screenshotPath,
                        `timeline_${i}`,
                        "facebook"
                    );
        
                    // Scroll down the page after each screenshot
                    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
                    console.log(`Scrolled down the page after screenshot ${i}.`);
                }
        
                // Navigate to the profile page and take a screenshot
                await page.goto("https://www.facebook.com/me/", {waitUntil: 'domcontentloaded', timeout:60000});
                const profileScreenshotPath = `profile_page.png`;
                await page.screenshot({ path: profileScreenshotPath, fullPage: false });
        
                const resultId = await uploadScreenshotToMongo(
                    username,
                    profileScreenshotPath,
                    "profile",
                    "facebook"
                );
        
                // Navigate to the friends list page
                await page.goto(`https://www.facebook.com/${username}/friends`);
                await page.waitForSelector('div[role="main"]');
        
                // Extract friends list
                try {
                    // Locate the element with an ID starting with "mount_"
                    await page.waitForSelector('[id^="mount_"]');
                    console.log("Mount container found.");
        
                    const friendsListContainerSelector =
                        '[id^="mount_"] div > div:nth-child(1) > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x78zum5.xdt5ytf.x1t2pt76 > div > div > div.x6s0dn4.x78zum5.xdt5ytf.x193iq5w > div > div > div > div:nth-child(1) > div > div > div > div';
        
                    await page.waitForSelector(friendsListContainerSelector);
                    console.log("Friends list container found.");
        
                    // Scroll to load all friends dynamically
                    async function scrollToLoadAllFriends() {
                        let previousHeight = 0;
                        let currentHeight = await page.evaluate(
                            (selector) => document.querySelector(selector).scrollHeight,
                            friendsListContainerSelector
                        );
        
                        while (currentHeight !== previousHeight) {
                            previousHeight = currentHeight;
                            await page.evaluate(
                                (selector) =>
                                    document.querySelector(selector).scrollBy(0, 500),
                                friendsListContainerSelector
                            );
                            await page.waitForTimeout(1000); // Wait for lazy loading
                            currentHeight = await page.evaluate(
                                (selector) => document.querySelector(selector).scrollHeight,
                                friendsListContainerSelector
                            );
                        }
                    }
        
                    // Scroll to load all friends
                    await scrollToLoadAllFriends();
        
                    // Extract friend data
                    const usersData = await page.evaluate((selector) => {
                        const container = document.querySelector(selector);
                        const friendTiles = container.querySelectorAll(
                            'div.x78zum5.x1q0g3np.x1a02dak.x1qughib > div'
                        );
        
                        console.log(`Total friend tiles found: ${friendTiles.length}`);
        
                        const users: any[] | Promise<any[]> = [];
                        friendTiles.forEach((friendTile, index) => {
                            const profilePic = friendTile.querySelector('div:nth-child(1) > a img');
                            const profilePicUrl = profilePic ? (profilePic as HTMLImageElement).src : null;
        
                            const nameElement = friendTile.querySelector(
                                'div.x1iyjqo2.x1pi30zi > div:nth-child(1) > a > span'
                            );
                            const userName = nameElement ? nameElement.textContent.trim() : null;
        
                            const profileAnchor = friendTile.querySelector('div:nth-child(1) > a');
                            const profileUrl = profileAnchor ? (profileAnchor as HTMLAnchorElement).href : null;
        
                            if (profilePicUrl && userName) {
                                users.push({
                                    index: index + 1,
                                    userName,
                                    profilePicUrl,
                                    profileUrl: profileUrl || "Profile URL not found",
                                });
                            }
                        });
        
                        return users;
                    }, friendsListContainerSelector);
        
                    console.log("Extracted Friend Data:", usersData);
        
                    // Insert followers into MongoDB
                    await insertFollowers(username, usersData, "facebook");
                } catch (error) {
                    console.error("An error occurred while extracting friends data:", error);
                } finally {
                    
                }
            } catch (error) {
                console.error("An unexpected error occurred:", error);
            }
        })();
        
        await page.goto('https://facebook.com/me', {waitUntil: 'domcontentloaded', timeout: 60000});
        page.waitForTimeout(2000);
        
        resultId = await scrapeFacebookPosts(username, page, limit);
    
        await scrapeFacebookChats(page, username, pin);
        await scrapeFacebookActivity(page);

     
        
        console.log("Completed scraping");
        return resultId;
        
    } catch (error) {
        console.error("Error during scraping:", error);
    } finally {
        if (context) {
            await context.close();
        }
    }
}

       // Navigate to the download page
        //     await page.goto("https://www.facebook.com/secure_storage/dyi");
        //     await page.waitForTimeout(2000); // Delay to simulate human-like behavior

        //     // Wait for the button with aria-label="Download file"
        //     await page.waitForSelector('div[aria-label="Download file"]');

        //     // Click on the button
        //     await page.evaluate(() => {
        //         const button = document.querySelector(
        //             'div[aria-label="Download file"]',
        //         );
        //         if (button) {
        //             (button as HTMLElement).click();
        //             console.log("Clicked on the Download file button.");
        //         } else {
        //             console.log("Download file button not found.");
        //         }
        //     });
        //     await page.waitForTimeout(2000); // Delay after clicking

        //     // Wait for the password input field to appear
        //     await page.waitForSelector('input[type="password"]');

        //     // Type the password and log it
        //     await page.type('input[type="password"]', password, {
        //         delay: 1000,
        //     }); // Adjust delay as needed
        //     console.log("Password typed in.");
        //     await page.waitForTimeout(1000); // Delay after typing

        //     // Wait for the Confirm button and click it
        //     await page.waitForSelector('div[aria-label="Confirm"]');
        //     console.log("Confirm button found.");
        //     await page.evaluate(() => {
        //         const confirmButton = document.querySelector(
        //             'div[aria-label="Confirm"]',
        //         );
        //         if (confirmButton) {
        //             (confirmButton as HTMLElement).click();
        //             console.log("Clicked the Confirm button.");
        //         } else {
        //             console.log("Confirm button not found.");
        //         }
        //     });
        //     await page.waitForTimeout(2000); // Delay to simulate human interaction

        //     // Wait for the Download button and click it
        //     await page.waitForSelector('div[aria-label="Download"]');
        //     console.log("Download button found.");
        //     await page.evaluate(() => {
        //         const downloadButton = document.querySelector(
        //             'div[aria-label="Download"]',
        //         );
        //         if (downloadButton) {
        //             (downloadButton as HTMLElement).click();
        //             console.log("Clicked the Download button.");
        //         } else {
        //             console.log("Download button not found.");
        //         }
        //     });
        //     await page.waitForTimeout(3000); // Delay to allow the download to initiate
        // 
