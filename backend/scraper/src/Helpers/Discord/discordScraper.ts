import { chromium } from "playwright";
import { __dirname } from "../../../../../config.js";
import fs from "fs";
import path from "path";
import { uploadChats, uploadToS3 } from "../mongoUtils.js"; // Ensure this is correctly defined elsewhere

export const scrapeDiscord = async (username:string, password:string) => {
    try {
        const outputDir = path.join(__dirname, "scraper/src/Helpers/Discord");

        // Launch the browser with a persistent context
        const browser = await chromium.launchPersistentContext("./discord", {
            headless: false, // Set to true for headless mode
            slowMo: 500,
        });

        const page = browser.pages()[0] || (await browser.newPage());

        // Navigate to Discord login
        await page.goto("https://discord.com/login");
        await page.waitForTimeout(3000);

        // Log in if needed
        const currentURL = page.url();
        if (currentURL === "https://discord.com/login") {
            await page.fill('input[name="email"]', username);
            await page.fill('input[name="password"]', password);
            await page.click('button[type="submit"]');
            await page.waitForNavigation({ timeout: 10000 }).catch(() => {
                console.error("Login failed or took too long.");
            });
        } else {
            console.log("Already logged in.");
        }

        // Wait for the DM list
        await page.waitForSelector(
            'ul[role="list"][aria-label="Direct Messages"]'
        );
        const dmList = await page.$(
            'ul[role="list"][aria-label="Direct Messages"]'
        );

        if (dmList) {
            const dmItems = await dmList.$$('li[role="listitem"]');
            for (let i = 2; i < dmItems.length; i++) {
                try {
                    const dmItem = await dmList.$(`li:nth-child(${i + 1})`);
                    if (!dmItem) continue;

                    const link = await dmItem.$("a[aria-label]");
                    if (!link) continue;

                    const recipientUsername = await link.getAttribute(
                        "aria-label"
                    );
                   // const chatLink = await link.getAttribute("href");

                    const sanitizedUsername = recipientUsername!.replace(
                        /[^a-zA-Z0-9]/g,
                        "_"
                    );
                    const logFilePath = path.join(
                        outputDir,
                        `${sanitizedUsername}_chat_logs.txt`
                    );
                    
                    const screenshotPaths = [];

                    if (!fs.existsSync(outputDir)) {
                        fs.mkdirSync(outputDir, { recursive: true });
                    }

                    await link.click();
                    await page.waitForSelector('ol[role="list"]');

                    let messageCount = 0;
                    const scrollerSelector = 'ol[role="list"]';
                    let direction = -1000; // Start by scrolling upward
                    let lastMessageCount = 0;
                    let noNewItems = false;

                    while (!noNewItems) {
                        const messages = await page.$$(
                            scrollerSelector + " > li"
                        );

                        if (messages.length > lastMessageCount) {
                            lastMessageCount = messages.length;

                            for (let j = 2; j < messages.length; j++) {
                                const content = await messages[j].innerText();
                                try {
                                    fs.appendFileSync(
                                        logFilePath,
                                        `Message: ${content}\n`,
                                        "utf-8"
                                    );
                                } catch (fileError) {
                                    console.error(
                                        `Error writing to log file: ${logFilePath}`,
                                        fileError
                                    );
                                }

                                messageCount++;

                                if (messageCount % 5 === 0) {
                                    const screenshotPath = path.join(
                                        outputDir,
                                        `${recipientUsername}_screenshot_${messageCount}.png`
                                    );
                                    await page.screenshot({
                                        path: screenshotPath,
                                    });
                                    screenshotPaths.push(screenshotPath);
                                }
                            }
                        } else {
                            // No new items loaded, switch direction
                            if (direction === -1000) {
                                direction = 1000; // Start scrolling downward
                            } else {
                                noNewItems = true; // Stop scrolling
                            }
                        }

                        await page.evaluate(
                            ({ selector, direction }) => {
                                const scroller =
                                    document.querySelector(selector);
                                if (scroller) scroller.scrollTop += direction;
                            },
                            { selector: scrollerSelector, direction }
                        );

                        await page.waitForTimeout(1000);
                    }
                    const s3Key = `${username}/${recipientUsername}_chat_logs.txt`;
                    const s3Url = await uploadToS3(logFilePath, s3Key);
                    await uploadChats(
                        username,
                        recipientUsername!,
                        screenshotPaths,
                        s3Url,
                        "discord"
                    );

                    fs.unlinkSync(logFilePath);
                    for (const screenshotPath of screenshotPaths) {
                        fs.unlinkSync(screenshotPath);
                    }
                } catch (err) {
                    console.error(`Error processing DM:`, err);
                }
            }
        }

        await browser.close();
    } catch (error) {
        console.error("Error in scrapeDiscord:", error);
    }
};
