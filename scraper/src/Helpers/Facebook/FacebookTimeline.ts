import { chromium, Browser, Page } from 'playwright';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { uploadScreenshotToMongo } from '../mongoUtils';
import fs from 'fs';
import path from 'path';

// Use the stealth plugin to avoid detection
puppeteer.use(StealthPlugin());


// Random delay between actions to mimic human behavior
function randomDelay(min: number, max: number) {
  return new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
}

export async function scrapeFacebook( email: string, password: string ) {
  let browser: Browser | null = null;
  try {
    // Launch the browser
    browser = await chromium.launch({ headless: false, slowMo: 500, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const context = await browser.newContext();
    const page: Page = await context.newPage();

    // Navigate to Facebook login page
    await page.goto('https://www.facebook.com/', { waitUntil: 'networkidle' });

    // Wait for the username input and enter the username
    await page.waitForSelector('#email', { timeout: 30000 });
    await page.fill('#email', email);
    console.log('Entered Facebook username.');

    // Wait for the password input and enter the password
    await page.waitForSelector('#pass', { timeout: 30000 });
    await page.fill('#pass', password);
    console.log('Entered Facebook password.');

    // Wait for the login button to be visible and click it
    await page.waitForSelector('button[data-testid="royal_login_button"]', { timeout: 30000 });
    await page.click('button[data-testid="royal_login_button"]');
    console.log('Clicked Facebook login button.');

    // Wait for the specified screen element to load after login
    
    console.log('Successfully logged in and the screen element has loaded.');
    await randomDelay(20000, 40000);

    await page.goto('https://www.facebook.com/me/', { waitUntil: 'networkidle' });

    const currentUrl = page.url();
    let username = currentUrl.split('.com/')[1];
    
    if (username) {
        // Remove the trailing slash if it exists
        username = username.replace(/\/$/, ''); // This removes a trailing slash
        console.log(`Username extracted: ${username}`);
    } else {
        console.log('Username could not be extracted.');
    }
    
    await page.goto('https://www.facebook.com',  { waitUntil: 'networkidle' });
    // Take at least three screenshots with random delays and scroll
    for (let i = 1; i <= 3; i++) {
      await randomDelay(2000, 4000); // Random delay between 2-4 seconds
      const screenshotPath = `facebook_screenshot_${i}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Took screenshot ${i}.`);


      await uploadScreenshotToMongo(username, screenshotPath, `timeline_${i}`, 'facebook');
      // Scroll down the page after each screenshot
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      console.log(`Scrolled down the page after screenshot ${i}.`);
    }   
    // Wait for the profile page to load
    await page.goto("https://www.facebook.com/me/")


    // Extract post data from the profile page
    await page.waitForSelector('div[id^="mount_"]');
// Wait for the post container using XPath
const xpath = '/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div/div/div[4]/div[2]/div/div[2]/div[3]';
await page.waitForSelector('xpath/' + xpath);

const postsContainer = await page.$('xpath/' + xpath);

if (postsContainer) {
    console.log('Posts container found');

    // Get all direct child divs representing posts
    const postDivs = await page.evaluate(container => {
        return Array.from(container.children).map((_, index) => index + 1);
    }, postsContainer);

    if (postDivs.length > 0) {
        console.log(`Found ${postDivs.length} post(s).`);
        for (let i = 0; i < postDivs.length; i++) {
            const postXPath = `${xpath}/div[${postDivs[i]}]`;
            const postElement = await page.$('xpath/' + postXPath);

            if (postElement) {
                // Scroll to the post and wait for it to load
                await page.evaluate(el => el.scrollIntoView(), postElement);
                await page.waitForTimeout(500); // Wait for smooth scrolling and rendering

                // Take a screenshot of the post
                const screenshotPath = path.join(__dirname, `post_${i + 1}.png`);
                await postElement.screenshot({ path: screenshotPath });
                console.log(`Screenshot for post ${i + 1} taken.`);

                // Upload the screenshot to MongoDB
                await uploadScreenshotToMongo(username, screenshotPath, `post_${i + 1}`,'facebook');
                console.log(`Screenshot for post ${i + 1} uploaded to MongoDB.`);

                // Delete the screenshot file after uploading if needed
                fs.unlinkSync(screenshotPath);
            } else {
                console.log(`Post ${i + 1} not found.`);
            }
        }
    } else {
        console.log('No posts found within the container.');
    }
} else {
    console.log('Posts container not found.');
}

    console.log('Completed taking screenshots.');
  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}