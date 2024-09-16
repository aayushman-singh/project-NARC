import { chromium, Browser, Page } from 'playwright';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Use the stealth plugin to avoid detection
puppeteer.use(StealthPlugin());


// Random delay between actions to mimic human behavior
function randomDelay(min: number, max: number) {
  return new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
}

export async function scrapeFacebook( FACEBOOK_USERNAME: string, FACEBOOK_PASSWORD: string ) {
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
    await page.fill('#email', FACEBOOK_USERNAME);
    console.log('Entered Facebook username.');

    // Wait for the password input and enter the password
    await page.waitForSelector('#pass', { timeout: 30000 });
    await page.fill('#pass', FACEBOOK_PASSWORD);
    console.log('Entered Facebook password.');

    // Wait for the login button to be visible and click it
    await page.waitForSelector('button[data-testid="royal_login_button"]', { timeout: 30000 });
    await page.click('button[data-testid="royal_login_button"]');
    console.log('Clicked Facebook login button.');

    // Wait for the specified screen element to load after login
    
    console.log('Successfully logged in and the screen element has loaded.');
    await randomDelay(10000, 12000);
    // Take at least three screenshots with random delays and scroll
    for (let i = 1; i <= 3; i++) {
      await randomDelay(2000, 4000); // Random delay between 2-4 seconds
      await page.screenshot({ path: `facebook_screenshot_${i}.png`, fullPage: false });
      console.log(`Took screenshot ${i}.`);
      
      // Scroll down the page after each screenshot
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      console.log(`Scrolled down the page after screenshot ${i}.`);
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


