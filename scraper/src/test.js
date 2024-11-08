import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import "dotenv/config";

// Use the Stealth plugin with Puppeteer
puppeteer.use(StealthPlugin());

const url = "https://www.instagram.com/";
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: "networkidle2" });

        // Login process
        await page.waitForSelector('input[name="username"]');
        await page.type('input[name="username"]', "aayushman3260");
        await page.waitForSelector('input[name="password"]');
        await page.type('input[name="password"]', "Lolok@027");
        await wait(500);
        await page.click('button[type="submit"]');

        await page.waitForNavigation({ waitUntil: "networkidle2" });

        // Check for Two-Factor Authentication prompt
        let otpRequired = false;
        // try {
        //   await page.waitForSelector('input[name="verificationCode"]', { timeout: 5000 }); // OTP field for 2FA
        //   otpRequired = true;
        //   console.log("2FA is enabled. Please enter the OTP sent to your mobile device in the browser window.");

        //   await page.waitForFunction(
        //     () => !document.querySelector('input[name="verificationCode"]'),
        //     { timeout: 60000 }
        //   );
        //   console.log("OTP entered successfully, continuing...");
        // } catch (error) {
        //   console.log("No 2FA detected, continuing login process...");
        // }

        // if (otpRequired) {
        //   await page.waitForNavigation({ waitUntil: "networkidle2" });
        // }

        try {
            await page.waitForSelector('div[role="button"][tabindex="0"]', {
                timeout: 1000,
            });
            await page.click('div[role="button"][tabindex="0"]');
        } catch (error) {
            console.log("Popup 1 appeared and handled.");
        }

        try {
            await page.waitForSelector("button._a9--", { timeout: 5000 });
            await page.evaluate(() => {
                const buttons = document.querySelectorAll("button._a9--");
                for (const button of buttons) {
                    if (button.textContent.includes("Not Now")) {
                        button.click();
                        break;
                    }
                }
            });
        } catch (error) {
            console.log("'Turn on Notifications' pop-up appeared and handled.");
        }

        await wait(2000);

        await page.screenshot({ path: "1stpage.png", fullPage: true });
        await wait(300);
        await page.goto(`https://www.instagram.com/${"aayushman3260"}/`, {
            waitUntil: "networkidle2",
        });
        await page.waitForSelector("header section");

        await page.screenshot({ path: "profilepage.png", fullPage: true });
        console.log("Screenshot saved as instagram_profile.png");

        await page.goto("https://www.instagram.com/direct/inbox/", {
            waitUntil: "networkidle2",
        });
        console.log("Navigated to the chat section");
        await wait(800);
        await page.waitForSelector('div[role="listitem"]', { timeout: 30000 });

        const recentChats = await page.evaluate(() => {
            const chatItems = document.querySelectorAll('div[role="listitem"]');
            return Array.from(chatItems)
                .slice(0, 5)
                .map((item) => {
                    const usernameElement = item.querySelector(
                        "span.x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft",
                    );
                    return usernameElement
                        ? usernameElement.textContent.trim()
                        : "Unknown";
                });
        });

        console.log("Top recent chat usernames:");
        recentChats.forEach((username, index) => {
            console.log(`${index + 1}. ${username}`);
        });

        const chatWithAnuragClicked = await page.evaluate(() => {
            const chatItems = document.querySelectorAll('div[role="listitem"]');
            for (const item of chatItems) {
                const usernameElement = item.querySelector(
                    "span.x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft",
                );
                if (
                    usernameElement &&
                    usernameElement.textContent.trim() === "Aayushman"
                ) {
                    item.click();
                    return true;
                }
            }
            return false;
        });
        await wait(1000);

        if (chatWithAnuragClicked) {
            console.log("Successfully clicked on the chat with Anurag");
            await page.waitForSelector('div[role="row"]', { timeout: 30000 });
            console.log("Chat with Anurag is now open");
            //scroll
            const scrollChat = async () => {
                await page.evaluate(async () => {
                    const chatBox = document.querySelector('div[role="grid"]');
                    chatBox.scrollTo(0, chatBox.scrollHeight);
                });
                await wait(500);
            };

            let previousHeight;
            let newHeight = await page.evaluate(
                () => document.querySelector('div[role="grid"]').scrollHeight,
            );

            do {
                previousHeight = newHeight;
                await scrollChat();
                newHeight = await page.evaluate(
                    () =>
                        document.querySelector('div[role="grid"]').scrollHeight,
                );
            } while (newHeight > previousHeight);

            // Extract chat messages
            const messages = await page.evaluate(() => {
                const messageRows =
                    document.querySelectorAll('div[role="row"]');
                return Array.from(messageRows)
                    .map((row) => {
                        const senderElement = row.querySelector(
                            "h5 span.xzpqnlu, h4 span.xzpqnlu",
                        );
                        const textContentElement =
                            row.querySelector('div[dir="auto"]');
                        const mediaContentElement =
                            row.querySelector("video, img");

                        let sender = "Anurag";
                        let content = "";

                        if (textContentElement) {
                            content = `Text: ${textContentElement.textContent.trim()}`;
                        }

                        if (mediaContentElement) {
                            if (
                                mediaContentElement.tagName.toLowerCase() ===
                                "video"
                            ) {
                                content = "Reel: [Video Content]";
                            } else if (
                                mediaContentElement.tagName.toLowerCase() ===
                                "img"
                            ) {
                                content = "Image: [Image Content]";
                            }
                        }

                        if (senderElement) {
                            sender = senderElement.textContent.trim();
                        }

                        return { sender, content };
                    })
                    .filter((message) => message.content !== "");
            });

            console.log(`Number of messages found: ${messages.length}`);
            console.log("Chat messages:");
            messages.forEach((message, index) => {
                console.log(
                    `${index + 1}. ${message.sender}: ${message.content}`,
                );
            });
        } else {
            console.log("Couldn't find a chat with Anurag");
        }
    } catch (error) {
        console.error("Error occurred:", error);
    } finally {
        if (browser) {
            await browser.close();
        }
        console.log("Script completed. Exiting now.");
        process.exit(0);
    }
};

main();
