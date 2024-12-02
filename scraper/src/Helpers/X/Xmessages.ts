import { Page } from "playwright";
import fs from "fs";
import path from "path";
import { uploadChats, uploadToS3 } from "../mongoUtils";
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
                    ); // Update this selector based on actual structure
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

                // Perform infinite scroll upwards
                const messagesContainer = await page.$(
                    '[aria-label="Section details"]'
                );
                if (!messagesContainer) {
                    console.error("Messages section not found for this user.");
                    continue;
                }

                let previousHeight = 0;
                while (true) {
                    const currentHeight = await messagesContainer.evaluate(
                        (container) => container.scrollHeight
                    );
                    if (currentHeight === previousHeight) {
                        console.log(
                            "No more content to load, stopping infinite scroll."
                        );
                        break;
                    }

                    previousHeight = currentHeight;

                    await messagesContainer.evaluate((container) => {
                        container.scrollTo(0, 0); // Scroll to the top
                    });
                    await page.waitForTimeout(1000); // Allow time for content to load
                }

                // Extract messages and take screenshots every third message
                const messages = await messagesContainer.$$eval("div", (divs) =>
                    divs.map((div) => div.textContent?.trim())
                );

                if (messages.length === 0) {
                    console.log(`No messages found for user tile ${i + 1}.`);
                    continue;
                }

                console.log(
                    `Extracted ${messages.length} messages for user tile ${
                        i + 1
                    }.`
                );

                const sanitizedReceiver = receiverUsername.replace(
                    /[^a-zA-Z0-9_]/g,
                    ""
                );

                for (let j = 0; j < messages.length; j++) {
                    // Take a screenshot every third message
                    if ((j + 1) % 3 === 0) {
                        const messageScreenshotPath = path.join(
                            __dirname,
                            `${sanitizedReceiver}_message_${j + 1}.png`
                        );
                        await page.screenshot({ path: messageScreenshotPath });
                        screenshotPaths.push(messageScreenshotPath);
                        console.log(
                            `Screenshot taken for message ${
                                j + 1
                            }: ${messageScreenshotPath}`
                        );
                    }
                }

                // Save chat logs to a file
                const chatLogPath = `./chat_logs_${sanitizedReceiver}.txt`;
                fs.writeFileSync(chatLogPath, messages.join("\n"));
                console.log(
                    `Chat logs saved to file for ${sanitizedReceiver}.`
                );

                // Upload chat logs and screenshots
                const chatLogS3Key = `${receiverUsername}/chat_logs_${sanitizedReceiver}.txt`;
                const chatLogUrl = await uploadToS3(chatLogPath, chatLogS3Key);
                console.log(
                    `Chat logs uploaded to S3 for ${sanitizedReceiver}: ${chatLogUrl}`
                );

                await uploadChats(
                    username,
                    receiverUsername,
                    screenshotPaths,
                    chatLogUrl,
                    platform
                );
                console.log(
                    `Chat metadata uploaded to MongoDB for ${sanitizedReceiver}.`
                );

                // Clean up local files
                fs.unlinkSync(chatLogPath);
                for (const path of screenshotPaths) {
                    fs.unlinkSync(path);
                }
                console.log(`Cleaned up local files for ${sanitizedReceiver}.`);
            }
        } else {
            console.log("No user tiles found.");
        }
    } catch (err) {
        console.error("Error occurred:", err);
    }
}
