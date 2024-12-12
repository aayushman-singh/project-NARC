import { Page } from "playwright";
import fs from "fs";
import path from "path";
import { uploadChats, uploadToS3 } from "../mongoUtils.js";
import { __dirname } from "../../../../../config.js";

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
        const chatsSelector = 'div[aria-label="Chats"]';
        await page.waitForSelector(chatsSelector);
        console.log("Chats container loaded.");

        // Find all chat links
        const chatLinks = await page.$$eval(
            `${chatsSelector} a[aria-current]`,
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
            const fullChatLink = chatLink?.startsWith("http")
                ? chatLink
                : `https://facebook.com${chatLink}`;

            await page.goto(fullChatLink, { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(3000);

            console.log(`Navigated to chat: ${fullChatLink}`);

            // Wait for messages to load
            const messageContainerSelector =
                'div[aria-label^="Messages in conversation with"]';
            await page.waitForSelector(messageContainerSelector);

            const ariaLabel = await page.getAttribute(
                messageContainerSelector,
                "aria-label"
            );
            const receiverUsername = ariaLabel
                ?.replace("Messages in conversation with ", "")
                .trim();
            console.log(
                `Processing messages for ${receiverUsername || "unknown user"}`
            );

            const messages = await page.$$eval(
                `${messageContainerSelector} div > div:nth-child(2)`,
                (messageElements) =>
                    Array.from(messageElements).map((element) => {
                        const messageDiv =
                            element.querySelector("div:nth-child(1)");
                        const timestampSpan = element.querySelector(
                            "div:nth-child(2) > span"
                        );

                        return {
                            messageText:
                                messageDiv?.textContent?.trim() || "No text",
                            timestamp:
                                timestampSpan?.textContent?.trim() ||
                                "No timestamp",
                        };
                    })
            );

            // Filter messages to remove unwanted rows
            const filteredMessages = messages.filter(
                ({ messageText, timestamp }) =>
                    !(
                        (timestamp === "No timestamp" &&
                            (messageText === "No text" ||
                                messageText === "Enter")) ||
                        timestamp === "No timestamp"
                    )
            );

            console.log(
                `Filtered ${filteredMessages.length} messages for chat ${
                    i + 1
                }.`
            );

            const screenshotPaths = [];

            // Iterate over messages to take screenshots
            for (let j = 0; j < filteredMessages.length; j++) {
                const { messageText, timestamp } = filteredMessages[j];

                // Scroll to the message
                await page.evaluate((index) => {
                    const element = document.querySelectorAll(
                        'div[aria-label^="Messages in conversation with"] div > div:nth-child(2)'
                    )[index];
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }, j);

                // Take a screenshot every third message
                if ((j + 1) % 3 === 0) {
                    const screenshotPath = path.join(
                        __dirname,
                        `scraper/src/Helpers/Facebook/chat_${
                            receiverUsername || `receiver_${i + 1}`
                        }_message_${j + 1}.png`
                    );
                    await page.screenshot({ path: screenshotPath });
                    screenshotPaths.push(screenshotPath);
                    console.log(
                        `Screenshot taken for message ${
                            j + 1
                        }: ${screenshotPath}`
                    );
                }
            }

            // Save filtered chat logs to a file
            const chatLogPath = path.join(
                __dirname,
                "scraper/src/Helpers/Facebook",
                `chat_${receiverUsername}_logs.txt`
            );
            const chatLogs = filteredMessages
                .map(
                    ({ messageText, timestamp }) =>
                        `${timestamp}: ${messageText}`
                )
                .join("\n");
            fs.writeFileSync(chatLogPath, chatLogs);

            console.log(`Filtered chat logs saved to ${chatLogPath}.`);

            // Upload logs and screenshots
            const chatLogS3Key = `${username}/${
                receiverUsername || `receiver_${i + 1}`
            }/chat_logs.txt`;
            const chatLogUrl = await uploadToS3(chatLogPath, chatLogS3Key);

            await uploadChats(
                username,
                receiverUsername || `receiver_${i + 1}`,
                screenshotPaths,
                chatLogUrl,
                "facebook"
            );

            console.log(
                `Chat logs and metadata uploaded for chat ${
                    receiverUsername || `receiver_${i + 1}`
                }.`
            );

            // Clean up local files
            fs.unlinkSync(chatLogPath);
            for (const path of screenshotPaths) {
                fs.unlinkSync(path);
            }
            console.log(
                `Cleaned up local files for chat ${
                    receiverUsername || `receiver_${i + 1}`
                }.`
            );
        }
    } catch (error) {
        console.error("Error during Facebook chat processing:", error);
    }
}
