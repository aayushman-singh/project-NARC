import { Browser, chromium, Page } from "playwright";
import fs from "fs/promises";
import path from "path";
import { uploadChats, uploadToS3 } from "../mongoUtils";
import { __dirname } from "../../../../config";
import dotenv from "dotenv";

dotenv.config();

async function connectToExistingChrome() {
    try {
        // Connect to Chrome running in debug mode
        const browserURL = "http://localhost:9223";
        const browser = await chromium.connectOverCDP(browserURL);
        return browser;
    } catch (error) {
        console.error("Failed to connect to Chrome debug mode:", error);
        throw error;
    }
}
async function handleButtonSequence(page: Page, recipientUsername: string) {
    try {
        // Find the header with the specific class
        const header = page.locator("header.x1n2onr6");

        // Find nested div with role button inside the header
        const profileDetailsButton = header.locator('div[role="button"]');

        // Wait for the element to be visible and then click
        await profileDetailsButton.waitFor({ state: "visible" });
        await profileDetailsButton.click();

        // Click on Media, links and docs button
        await page
            .getByRole("button", { name: "Media, links and docs" })
            .click();

        // Select all image list items
        const listItems = page.getByRole("listitem", { name: " Image" });
        const count = await listItems.count();

        // Download images one by one
        for (let i = 0; i < count; i++) {
            await listItems.nth(i).hover();
            const checkbox = listItems
                .nth(i)
                .locator('button[role="checkbox"]');
            await checkbox.click();

            // Download handling
            try {
                const downloadButton = page.getByLabel("Download");
                await downloadButton.waitFor({
                    state: "visible",
                    timeout: 5000,
                });

                const downloadPromise = page.waitForEvent("download");
                await downloadButton.click();

                const download = await downloadPromise;
                console.log("Download completed:", await download.path());
            } catch (error) {
                console.error("Download failed:", error);

                await page.screenshot({
                    path: `download-error-${Date.now()}.png`,
                    fullPage: true,
                });
            }
        }
    } catch (error) {
        console.error("Error during button sequence:", error);
        await page.screenshot({
            path: `error-screenshot-${Date.now()}.png`,
            fullPage: true,
        });
        throw error;
    }
}

const scrollChatWithLogging = async (
    username: string,
    receiverUsername: string,
    page: Page,
    messageContainerSelector: string,
    outputDir: string,
    limit: number
) => {
    const screenshotPaths: string[] = [];
    const textFilePath = path.join(outputDir, `chat_text.txt`);
    try {
        console.log("Starting infinite scrolling upward...");
        let totalMessageCount = 0;
        let attempt = 0;

        while (totalMessageCount < limit) {
            while (attempt < 10) {
                const messageRows = await page.$$(
                    messageContainerSelector +
                        " div.message-in, div.message-out"
                );
                const newMessageCount = messageRows.length;

                if (newMessageCount > totalMessageCount) {
                    const messagesToLoad = Math.min(
                        newMessageCount - totalMessageCount,
                        limit - totalMessageCount
                    );

                    console.log(
                        `Loaded ${messagesToLoad} new messages (Total: ${
                            totalMessageCount + messagesToLoad
                        }/${limit}).`
                    );

                    totalMessageCount += messagesToLoad;
                    attempt = 0; // Reset attempts if new messages are found

                    // Scroll to the first visible row
                    await messageRows[0].scrollIntoViewIfNeeded();
                    await page.waitForTimeout(1500); // Wait for messages to load
                } else {
                    attempt++;
                    console.log(
                        `No new messages found. Waiting... (Attempt ${attempt}/10)`
                    );
                    await page.waitForTimeout(2000);
                }

                if (totalMessageCount >= limit) {
                    console.log(
                        `Reached the limit of ${limit} messages. Stopping scroll.`
                    );
                    break;
                }
            }

            if (attempt >= 10) {
                console.log(
                    "No more messages to load after 10 attempts. Stopping."
                );
                break;
            }
        }

        console.log(
            "Finished scrolling upward. Now capturing messages and screenshots..."
        );

        // Simplified logging and screenshot phase
        await fs.mkdir(path.dirname(textFilePath), { recursive: true });
        const messageRows = await page.$$(
            messageContainerSelector + " div.message-in, div.message-out"
        );

        for (let msg = 0; msg < messageRows.length; msg++) {
            const messageRow = messageRows[msg];
            const messageText = await messageRow?.innerText();

            if (messageText) {
                const isIncoming = await messageRow.evaluate((node) =>
                    node.classList.contains("message-in")
                );
                const messageType = isIncoming ? "Incoming" : "Outgoing";
                await fs.appendFile(
                    textFilePath,
                    `${messageType} Message ${msg + 1}: ${messageText}\n`
                );
                console.log(
                    `${messageType} Message ${msg + 1} written to text file.`
                );
            }

            if (msg % 3 === 0) {
                await messageRow.scrollIntoViewIfNeeded();
                await page.waitForTimeout(500);
                const screenshotPath = path.join(
                    outputDir,
                    `${username}_${receiverUsername}_screenshot_${msg + 1}.png`
                );
                await page.screenshot({ path: screenshotPath });
                console.log(`Screenshot saved for message ${msg + 1}.`);
                screenshotPaths.push(screenshotPath);
            }
        }

        // Upload chat text file to S3
        const chatLogKey = `${username}/${receiverUsername}_chat_log.txt`;
        const chatLogURL = await uploadToS3(textFilePath, chatLogKey);
        console.log(`Chat log uploaded to S3: ${chatLogURL}`);

        // Upload screenshots and chat log URL to MongoDB
        await uploadChats(
            username,
            receiverUsername,
            screenshotPaths,
            chatLogURL,
            "whatsapp"
        );
        console.log("Finished capturing messages and screenshots.");
    } catch (error: any) {
        console.error(
            "Error during scrolling and screenshot capture:",
            error.message
        );
    }
};
const whatsappScraper = async (username: string, limit: number) => {
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
        // Connect to existing Chrome instance
        browser = await connectToExistingChrome();

        // Get the first page/tab
        const contexts = browser.contexts();
        if (contexts.length === 0) {
            throw new Error("No browser contexts found");
        }
        const context = contexts[0];
        const pages = context.pages();

        // Find or navigate to WhatsApp Web
        let page = pages.find((p) => p.url().includes("web.whatsapp.com"));

        if (!page) {
            // If WhatsApp Web is not open, navigate to it
            page = await context.newPage();
            await page.goto("https://web.whatsapp.com/", {
                waitUntil: "networkidle",
            });
            await page.waitForTimeout(10000); // Add a 10-second delay
        }

        // Wait for QR code scan only if cookies are not loaded
        if (!(await page.$('div[aria-label="Chat list"]'))) {
            console.log("Waiting for user to scan the QR code...");
            await page.waitForSelector(
                'canvas[aria-label="Scan this QR code to link a device!"]',
                { state: "detached" }
            );
            console.log("Logged in successfully!");
        } else {
            console.log("Session restored successfully!");
        }

        // Select the main chat container once logged in
        const chatContainerSelector = 'div[aria-label="Chat list"]';
        await page.waitForSelector(chatContainerSelector, { timeout: 10000 });

        await page.waitForTimeout(2500);
        // Iterate through each chat user tile
        const chatTiles = await page.$$(
            chatContainerSelector + ' div[role="listitem"]'
        );

        for (const [index, chatTile] of chatTiles.entries()) {
            let receiverUsername =
                (await chatTile.textContent()) || `chat_${index}`;
            receiverUsername = receiverUsername
                .split(":")[0]
                .replace(/[^a-zA-Z0-9_]/g, "");
            console.log(`Processing chat ${index + 1}: ${receiverUsername}`);

            // Click on each chat tile to open the chat
            await chatTile.click();
            await page.waitForTimeout(2000); // Wait for chat to load

            await handleButtonSequence(page, receiverUsername);
            console.log(`downloads done for ${receiverUsername}`);

            // Define the message container selector and output directory
            const messageContainerSelector = 'div[role="application"]';
            const outputDir = path.join(
                __dirname,
                `screenshots_chat_${index + 1}`
            );
            await scrollChatWithLogging(
                username,
                receiverUsername,
                page,
                messageContainerSelector,
                outputDir,
                limit
            );
        }
        console.log("All chats processed successfully!");
    } catch (error) {
        console.error("Error in whatsappScraper:", error);
    } finally {
        // Note: Do not close the browser as it's an existing instance
        if (page) await page.close();
    }
};

export default whatsappScraper;