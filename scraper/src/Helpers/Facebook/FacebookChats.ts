import { Page } from "playwright";
import path, { dirname } from "path";
import { uploadChats, uploadToS3 } from "../mongoUtils";
import { fileURLToPath } from "url";
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function scrapeFacebookChats(
    page: Page,
    username: string,
    pin: string
) {
    try {
        // Navigate to Facebook Messages
        await page.goto("https://facebook.com/messages", { timeout: 8000 });

        await page.waitForTimeout(5000);

        // Enter PIN if prompted
        const pinSelector =
            "#mw-numeric-code-input-prevent-composer-focus-steal";
        const pinInput = await page.$(pinSelector);

        if (pinInput) {
            await pinInput.type(pin);
            console.log("PIN entered successfully.");
        } else {
            console.log("PIN input field not found, moving on.");
        }

        // Wait for the Chats container to load
        await page.waitForSelector('div[aria-label="Chats"]');
        console.log("Chats container loaded.");

        // Find all chat links
        const chatLinks = await page.$$eval(
            'div[aria-label="Chats"] a[aria-current]',
            (links) =>
                Array.from(links).map((link) => link.getAttribute("href"))
        );

        if (!chatLinks || chatLinks.length === 0) {
            console.log("No chat links found.");
            return;
        }

        console.log(`Found ${chatLinks.length} chat link(s).`);

        for (let i = 0; i < chatLinks.length; i++) {
            const chatLink = chatLinks[i];

           const fullChatLink = chatLink.startsWith("http")
               ? chatLink
               : `https://facebook.com${chatLink}`;

           // Navigate to the chat
           await page.goto(fullChatLink, { waitUntil: "load" });
           console.log(`Navigated to chat: ${fullChatLink}`);
            console.log(`Navigated to chat ${i + 1}.`);

            // Wait for messages to load
            await page.waitForSelector("#\\:ree\\: > div > div > div");
            console.log("Messages container loaded.");

            // Extract and log messages
            const messagesData = await page.$$eval(
                "#\\:ree\\: > div > div > div > div > div > div:nth-child(2)",
                (messageElements) => {
                    return Array.from(messageElements).map((element) => {
                        const messageDiv =
                            element.querySelector("div:nth-child(1)");
                        const timestampSpan = element.querySelector(
                            "div:nth-child(2) > span"
                        );

                        const messageText =
                            messageDiv?.textContent?.trim() || "No text";
                        const timestamp =
                            timestampSpan?.textContent?.trim() ||
                            "No timestamp";

                        return { messageText, timestamp };
                    });
                }
            );

            if (messagesData.length === 0) {
                console.log(`No messages found for chat ${i + 1}.`);
                continue;
            }

            console.log(
                `Extracted ${messagesData.length} messages for chat ${i + 1}.`
            );

            const screenshotPaths: string[] = [];
            const receiverUsername = `receiver_${i + 1}`; // Replace this with actual receiver extraction logic if needed

            // Scroll to each message and take screenshots every third message
            for (let j = 0; j < messagesData.length; j++) {
                const { messageText, timestamp } = messagesData[j];

                // Scroll to message
                await page.evaluate((index) => {
                    const element = document.querySelectorAll(
                        "#\\:ree\\: > div > div > div > div > div > div:nth-child(2)"
                    )[index];
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }, j);

                console.log(`Message ${j + 1}: ${messageText}`);
                console.log(`Timestamp: ${timestamp}`);

                // Take a screenshot every third message
                if ((j + 1) % 3 === 0) {
                    const screenshotPath = path.join(
                        __dirname,
                        `chat_${i + 1}_message_${j + 1}.png`
                    );
                    await page.screenshot({ path: screenshotPath });
                    screenshotPaths.push(screenshotPath);
                    console.log(
                        `Screenshot taken for message ${
                            j + 1
                        }: ${screenshotPath}`
                    );
                }

                await page.waitForTimeout(1000); // Delay for smooth scrolling
            }

            // Save chat logs to a file
            const chatLogPath = path.join(__dirname, `chat_${i + 1}_logs.txt`);
            const chatLogs = messagesData
                .map(
                    ({ messageText, timestamp }) =>
                        `${timestamp}: ${messageText}`
                )
                .join("\n");
            fs.writeFileSync(chatLogPath, chatLogs);
            console.log(`Chat logs saved to ${chatLogPath}.`);

            // Upload logs and screenshots
            const chatLogS3Key = `${username}/${receiverUsername}/chat_logs.txt`;
            const chatLogUrl = await uploadToS3(chatLogPath, chatLogS3Key);

            await uploadChats(
                username,
                receiverUsername,
                screenshotPaths,
                chatLogUrl,
                "facebook"
            );
            console.log(
                `Chat logs and metadata uploaded for chat ${receiverUsername}.`
            );

            // Clean up local files
            fs.unlinkSync(chatLogPath);
            for (const path of screenshotPaths) {
                fs.unlinkSync(path);
            }
            console.log(`Cleaned up local files for chat ${receiverUsername}.`);
        }
    } catch (error) {
        console.error("Error during Facebook chat processing:", error);
    }
}
