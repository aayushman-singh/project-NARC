import { Page } from "playwright";
import fs from "fs";
import path from "path";
import { uploadToS3, uploadChats } from "../mongoUtils.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const filename = fileURLToPath(import.meta.url);
const __dirname = dirname(filename);

export async function scrapeXMessages(
    page: Page,
    username: string,
    platform: string
) {
    try {
        // Wait for the user tiles container to load
        await page.waitForSelector('[data-testid="conversation"]');

        // Select user tiles
        const userTiles = await page.$$('div[data-testid="conversation"]');

        if (userTiles.length > 0) {
            console.log(`Found ${userTiles.length} user tile(s).`);

            for (let i = 0; i < userTiles.length; i++) {
                const screenshotPaths: string[] = [];

                // Extract receiver username from the user tile
                const receiverUsername = await userTiles[i].evaluate((tile) => {
                    const nameElement = tile.querySelector(
                        "div > div > div > div > div > span"
                    );
                    return nameElement
                        ? nameElement.textContent?.trim()
                        : `user_${i + 1}`;
                });

                if (!receiverUsername) {
                    console.error(
                        `Receiver username not found for tile ${i + 1}`
                    );
                    continue;
                }

                console.log(`Extracted receiver username: ${receiverUsername}`);

                // Click on each user tile
                await userTiles[i].click();
                console.log(`Simulated click on user tile ${i + 1}.`);

                // Wait for the messages container to load
                await page.waitForTimeout(5000);

                // Locate messages container
                const messagesContainer = await page.$(
                    '[aria-label="Section details"]'
                );
                if (!messagesContainer) {
                    console.error("Messages container not found.");
                    continue;
                }

                // Extract all messages with text and timestamps
                const messagesData = await page.$$eval(
                    '[data-testid="cellInnerDiv"]',
                    (messageElements) => {
                        return Array.from(messageElements).map((element) => {
                            const messageDiv = element.querySelector(
                                "div > div:nth-child(1)"
                            );
                            const timestampSpan = element.querySelector(
                                "div > div:nth-child(2) > span"
                            );

                            const messageText =
                                messageDiv?.textContent?.trim() || null;
                            const timestamp =
                                timestampSpan?.textContent?.trim() || null;

                            return { messageText, timestamp };
                        });
                    }
                );

                if (messagesData.length === 0) {
                    console.log(`No messages found for user tile ${i + 1}.`);
                    continue;
                }

                console.log(
                    `Extracted ${messagesData.length} messages for user tile ${
                        i + 1
                    }.`
                );

                // Scroll to each message, log it, and take screenshots every third message
                for (let j = 0; j < messagesData.length; j++) {
                    const { messageText, timestamp } = messagesData[j];

                    // Scroll to the specific message element
                    await page.evaluate((index) => {
                        const element = document.querySelectorAll(
                            '[data-testid="cellInnerDiv"]'
                        )[index];
                        element.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                    }, j);

                    console.log(`Scrolled to message ${j + 1}.`);

                    console.log(`Message ${j + 1}:`);
                    console.log(`- Text: ${messageText || "No text found"}`);
                    console.log(
                        `- Timestamp: ${timestamp || "No timestamp found"}`
                    );

                    // Take a screenshot every third message
                    if ((j + 1) % 3 === 0) {
                        const messageScreenshotPath = path.join(
                            __dirname,
                            `${receiverUsername}_message_${j + 1}.png`
                        );
                        await page.screenshot({ path: messageScreenshotPath });
                        screenshotPaths.push(messageScreenshotPath);
                        console.log(
                            `Screenshot taken for message ${
                                j + 1
                            }: ${messageScreenshotPath}`
                        );
                    }

                    await page.waitForTimeout(1000); // Brief delay for smooth scrolling
                }

                // Save chat logs to a file
                const chatLogPath = `./chat_logs_${receiverUsername}.txt`;
                const chatLogs = messagesData
                    .map(
                        ({ messageText, timestamp }) =>
                            `${timestamp}: ${messageText}`
                    )
                    .join("\n");
                fs.writeFileSync(chatLogPath, chatLogs);
                console.log(`Chat logs saved to file for ${receiverUsername}.`);

                // Upload chat logs and screenshots
                const chatLogS3Key = `${receiverUsername}/chat_logs_${receiverUsername}.txt`;
                const chatLogUrl = await uploadToS3(chatLogPath, chatLogS3Key);
                console.log(
                    `Chat logs uploaded to S3 for ${receiverUsername}: ${chatLogUrl}`
                );

                await uploadChats(
                    username,
                    receiverUsername,
                    screenshotPaths,
                    chatLogUrl,
                    platform
                );
                console.log(
                    `Chat metadata uploaded to MongoDB for ${receiverUsername}.`
                );

                // Clean up local files
                fs.unlinkSync(chatLogPath);
                for (const path of screenshotPaths) {
                    fs.unlinkSync(path);
                }
                console.log(`Cleaned up local files for ${receiverUsername}.`);
            }
        } else {
            console.log("No user tiles found.");
        }
    } catch (err) {
        console.error("Error occurred:", err);
    }
}
