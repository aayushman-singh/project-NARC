import { Browser, chromium, Page } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { uploadChats } from '../mongoUtils';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function whatsappScraper(username: string) {
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
        // Launch a browser instance with Playwright
        browser = await chromium.launch({
            headless: false,  // Open in a visible browser for QR code scanning
        });
        
        // Open a new browser page
        page = await browser.newPage();

        // Go to WhatsApp Web
        await page.goto('https://web.whatsapp.com/');

        // Wait for the user to scan the QR code
        console.log('Waiting for user to scan the QR code...');
        await page.waitForSelector('canvas[aria-label="Scan this QR code to link a device!"]', { state: 'detached' });
        console.log('Logged in successfully!');

        // Select the main chat container once logged in
        const chatContainerSelector = 'div[aria-label="Chat list"]';

        // Wait for the main chat list to load
        await page.waitForSelector(chatContainerSelector);

        // Iterate through each chat user tile
        const chatTiles = await page.$$(chatContainerSelector + ' div[role="listitem"]');

        for (const [index, chatTile] of chatTiles.entries()) {
            // Click on each chat tile to open the chat
            await chatTile.click();
            await page.waitForTimeout(2000); // Wait for chat to load

            // Scroll through messages
            const messageContainerSelector = 'div[role="application"]';
            await page.waitForSelector(messageContainerSelector);

            // Array to store screenshot paths for this chat
            const screenshotPaths: string[] = [];

            // Number of times to scroll in each chat
            const scrollCount = 5;
            for (let scrollIndex = 0; scrollIndex < scrollCount; scrollIndex++) {
                // Scroll a bit in the chat
                await page.evaluate((selector) => {
                    const chatElement = document.querySelector(selector);
                    if (chatElement) chatElement.scrollBy(0, 300);
                }, messageContainerSelector);

                await page.waitForTimeout(1000); // Wait for content to load

                // Take a screenshot after each scroll
                const screenshotPath = path.join(
                    __dirname,
                    'screenshots',
                    `${username}_chat_${index + 1}`,
                    `scroll_${scrollIndex + 1}.png`
                );
                await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
                await page.screenshot({ path: screenshotPath, fullPage: false });
                console.log(`Screenshot saved for ${username}, chat ${index + 1}, scroll ${scrollIndex + 1}`);

                // Add screenshot path to the array
                screenshotPaths.push(screenshotPath);
            }

            // Upload screenshots to MongoDB for this chat
            await uploadChats(username, `chat_${index}`, screenshotPaths);
        }
    } catch (error) {
        console.error('Error in whatsappScraper:', error);
    } finally {
        if (page) await page.close();
        if (browser) await browser.close();
    }
}

export default whatsappScraper;
