import { chromium, Browser, Page } from 'playwright';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Use the stealth plugin to avoid detection
puppeteer.use(StealthPlugin());


// Random delay between actions to mimic human behavior
function randomDelay(min: number, max: number) {
  return new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
}

export async function scrapeX(USERNAME:string, PASSWORD:string) {
  let browser: Browser | null = null;
  try {
    // Launch the browser
    browser = await chromium.launch({ headless: true, slowMo: 500, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const context = await browser.newContext();
    const page: Page = await context.newPage();

    // Navigate to the X.com login page
    await page.goto('https://x.com/i/flow/login', { waitUntil: 'networkidle' });

    // Wait for the username input to appear and enter the username
    await page.waitForSelector('input[name="text"]', { timeout: 30000 });
    await page.fill('input[name="text"]', USERNAME);
    console.log('Entered username.');

    // Wait for the "Next" button to be visible and click it
    await page.waitForSelector('button[role="button"]:has-text("Next")', { timeout: 30000 });
    await page.click('button[role="button"]:has-text("Next")');
    console.log('Clicked next button after username.');

    // Wait for the password input to appear
    await page.waitForSelector('input[name="password"]', { timeout: 30000 });
    await page.fill('input[name="password"]', PASSWORD);
    console.log('Entered password.');

    // Wait for the "Log in" button to appear and click it
    await page.waitForSelector('button[data-testid="LoginForm_Login_Button"]', { timeout: 30000 });
    await page.click('button[data-testid="LoginForm_Login_Button"]');
    console.log('Clicked login button after password.');

    // Wait for the element after login to confirm successful navigation
    await page.waitForSelector('#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > main > div', { timeout: 30000 });
    console.log('Successfully logged in and main page loaded.');
    await page.waitForTimeout(7000);

    // Scroll through the timeline and take screenshots
    for (let i = 1; i <= 3; i++) {
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `timeline_screenshot${i}.png`, fullPage: false });
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    }

    console.log('Timeline scraping completed. Now navigating to profile, followers, and following pages.');

    // Visit user profile
    const profileUrl = `https://x.com/${USERNAME}`;
    await page.goto(profileUrl);
    console.log(`Navigated to profile: ${profileUrl}`);

    // Take a screenshot of the user profile
    await randomDelay(2000, 4000); // Random delay between 2-4 seconds
    await page.screenshot({ path: `${USERNAME}_profile.png`, fullPage: false });
    console.log('Took profile screenshot.');

    // Visit followers page
    const followersUrl = `${profileUrl}/followers`;
    await page.goto(followersUrl, { waitUntil: 'networkidle' });
    console.log(`Navigated to followers: ${followersUrl}`);

    // Scroll to the bottom of the followers list and take screenshots with random delays
    let previousHeight = 0;
    let currentHeight = await page.evaluate(() => document.body.scrollHeight);

    while (currentHeight !== previousHeight) {
      previousHeight = currentHeight;

      // Scroll down the page
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      console.log('Scrolled down followers page.');

      // Wait for content to load
      await randomDelay(3000, 5000); // Random delay between 3-5 seconds

      // Take a screenshot after each scroll
      await page.screenshot({ path: `${USERNAME}_followers_${Date.now()}.png`, fullPage: false });
      console.log('Took followers page screenshot.');

      // Update current height to check if we reached the bottom
      currentHeight = await page.evaluate(() => document.body.scrollHeight);
    }

    // Visit following page
    const followingUrl = `${profileUrl}/following`;
    await page.goto(followingUrl, { waitUntil: 'networkidle' });
    console.log(`Navigated to following: ${followingUrl}`);

    // Scroll to the bottom of the following list and take screenshots with random delays
    previousHeight = 0;
    currentHeight = await page.evaluate(() => document.body.scrollHeight);

    while (currentHeight !== previousHeight) {
      previousHeight = currentHeight;

      // Scroll down the page
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      console.log('Scrolled down following page.');

      // Wait for content to load
      await randomDelay(3000, 5000); // Random delay between 3-5 seconds

      // Take a screenshot after each scroll
      await page.screenshot({ path: `${USERNAME}_following_${Date.now()}.png`, fullPage: false });
      console.log('Took following page screenshot.');

      // Update current height to check if we reached the bottom
      currentHeight = await page.evaluate(() => document.body.scrollHeight);
    }

    console.log('Completed scraping profile, followers, and following.');
  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}



