import { Browser, chromium, Page } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { uploadChats, uploadToS3 } from '../mongoUtils';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Reusable function for scrolling and capturing screenshots
const scrollChatWithLogging = async (
    username: string,
    receiverUsername: string,
    page: Page,
    messageContainerSelector: string,
    outputDir: string
) => {
    const screenshotPaths: string[] = [];
    const textFilePath = path.join(outputDir, `chat_text.txt`);
    try {
        console.log('Starting infinite scrolling upward...');
        let previousMessageCount = 0;
        let newMessageCount = 0;
        let attempt = 0;
        
        // Phase 1: Scroll upward until attempts are exhausted
        while (attempt < 10) {
            const messageRows = await page.$$(messageContainerSelector + ' div.message-in, div.message-out');
            newMessageCount = messageRows.length;

            if (newMessageCount > previousMessageCount) {
                console.log(`Loaded ${newMessageCount - previousMessageCount} new messages.`);
                previousMessageCount = newMessageCount;
                attempt = 0; // Reset attempts if new messages are found

                // Scroll to the first visible row
                await messageRows[0].scrollIntoViewIfNeeded();
                await page.waitForTimeout(1000); // Wait for messages to load
            } else {
                attempt++;
                console.log(`No new messages found. Waiting... (Attempt ${attempt}/10)`);
                await page.waitForTimeout(2000);
            }
        }

        console.log('Finished scrolling upward. Now scrolling downward and taking screenshots...');

        // Phase 2: Scroll downward and take screenshots every third message
        let index = 0;
        let messagesLogged = 0;
        let msg = 0;
        await fs.mkdir(path.dirname(textFilePath), { recursive: true });
        while (index < previousMessageCount) {
            const messageRows = await page.$$(messageContainerSelector + ' div.message-in, div.message-out');

            if (index >= messageRows.length) {
                console.log('Reached the bottom of the chat.');
                break;
            }
            const messageRow = messageRows[msg];
            const messageText = await messageRow?.innerText();
            if (messageText) {
                // Write the message text to a file

                await fs.appendFile(textFilePath, `Message ${msg + 1}: ${messageText}\n`);
                console.log(`Message ${msg + 1} written to text file.`);
                
            }
        
            if (msg % 3 === 0) {
                // Scroll to the target row
                await messageRows[msg].scrollIntoViewIfNeeded();
                await page.waitForTimeout(500); // Small delay for smooth scrolling
        
                // Take and store screenshot
                const screenshotPath = path.join(outputDir, `screenshot_${++messagesLogged}.png`);
                await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
                await page.screenshot({ path: screenshotPath });
                console.log(`Screenshot ${messagesLogged} saved for message at index ${msg + 1}.`);

                screenshotPaths.push(screenshotPath);
            }
            msg++;
            index += 3; // Move to every third message
        }

         // Upload chat text file to S3
        const chatLogKey = `${username}/${receiverUsername}/chat_log.txt`;
        const chatLogURL = await uploadToS3(textFilePath, chatLogKey);
        console.log(`Chat log uploaded to S3: ${chatLogURL}`);

        // Upload screenshots and chat log URL to MongoDB

        await uploadChats(username, receiverUsername, screenshotPaths, chatLogURL);
        console.log('Finished scrolling downward and capturing screenshots.');
    } catch (error:any) {
        console.error('Error during scrolling and screenshot capture:', error.message);
    }
};

const whatsappScraper = async (username:string) => {
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
        // Launch a browser instance with Playwright
        const browser = await chromium.launchPersistentContext('./user-data', { headless: false });
        page = await browser.newPage();

        await page.goto('https://web.whatsapp.com/');
        
        // Wait for QR code scan only if cookies are not loaded
        if (!(await page.$('div[aria-label="Chat list"]'))) {
            console.log('Waiting for user to scan the QR code...');
            await page.waitForSelector('canvas[aria-label="Scan this QR code to link a device!"]', { state: 'detached' });
            console.log('Logged in successfully!');

        } else {
            console.log('Session restored successfully!');
        }

        // Select the main chat container once logged in
        const chatContainerSelector = 'div[aria-label="Chat list"]';
        await page.waitForSelector(chatContainerSelector);
        await page.waitForTimeout(2500);
        // Iterate through each chat user tile
        const chatTiles = await page.$$(chatContainerSelector + ' div[role="listitem"]');
        
        for (const [index, chatTile] of chatTiles.entries()) {
            let receiverUsername = await chatTile.textContent() || `chat_${index}`;
            receiverUsername = receiverUsername.split(':')[0];
            console.log(`Processing chat ${index + 1}: ${receiverUsername}`);

            // Click on each chat tile to open the chat
            await chatTile.click();
            await page.waitForTimeout(2000); // Wait for chat to load

            // Define the message container selector and output directory
            const messageContainerSelector = 'div[role="application"]';
            const outputDir = path.join(__dirname, `screenshots_chat_${index + 1}`);
            await scrollChatWithLogging(username, receiverUsername, page, messageContainerSelector, outputDir);
        }
        console.log('All chats processed successfully!');
    } catch (error) {
        console.error('Error in whatsappScraper:', error);
    } finally {
        if (page) await page.close();
        if (browser) await browser.close();
    }
};

export default whatsappScraper;
