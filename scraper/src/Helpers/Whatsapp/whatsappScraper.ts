import { Browser, chromium, Page } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { uploadChats } from '../mongoUtils';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Reusable function for scrolling and capturing screenshots
const scrollChatWithLogging = async (
    username: string,
    page: Page,
    messageContainerSelector: string,
    outputDir: string
) => {
    const screenshotPaths: string[] = [];
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

        while (index < previousMessageCount) {
            const messageRows = await page.$$(messageContainerSelector + ' div.message-in, div.message-out');

            if (index >= messageRows.length) {
                console.log('Reached the bottom of the chat.');
                break;
            }

            // Scroll to the target row
            await messageRows[index].scrollIntoViewIfNeeded();
            await page.waitForTimeout(500); // Small delay for smooth scrolling

            // Take and store screenshot
            const screenshotPath = path.join(outputDir, `screenshot_${++messagesLogged}.png`);
            await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
            await page.screenshot({ path: screenshotPath });
            console.log(`Screenshot ${messagesLogged} saved for message at index ${index + 1}.`);
            screenshotPaths.push(screenshotPath);
            index += 3; // Move to every third message
        }

        // Upload captured screenshots to MongoDB
        await uploadChats(username, outputDir, screenshotPaths);
        console.log('Finished scrolling downward and capturing screenshots.');
    } catch (error) {
        console.error('Error during scrolling and screenshot capture:', error.message);
    }
};

const whatsappScraper = async (username: string) => {
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
        // Launch a browser instance with Playwright
        browser = await chromium.launch({ headless: false });
        page = await browser.newPage();

        // Go to WhatsApp Web
        await page.goto('https://web.whatsapp.com/');

        // Wait for the user to scan the QR code
        console.log('Waiting for user to scan the QR code...');
        await page.waitForSelector('canvas[aria-label="Scan this QR code to link a device!"]', { state: 'detached' });
        console.log('Logged in successfully!');

        // Open the chat with the specified username
        const chatSelector = `span[title="${username}"]`;
        await page.waitForSelector(chatSelector);
        await page.click(chatSelector);
        console.log(`Opened chat with ${username}`);
        await page.waitForTimeout(2000); // Wait for chat to load

        // Define the message container selector
        const messageContainerSelector = 'div[role="application"]';

        // Define the output directory for screenshots
        const outputDir = path.join(__dirname, `screenshots_${username}`);
        await scrollChatWithLogging(username, page, messageContainerSelector, outputDir);
    } catch (error) {
        console.error('Error in whatsappScraper:', error);
    } finally {
        if (page) await page.close();
        if (browser) await browser.close();
    }
};

export default whatsappScraper;
