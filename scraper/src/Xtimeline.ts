import { chromium, Browser, Page } from 'playwright';

// Login credentials
const USERNAME = 'aayushman2702@gmail.com';
const PASSWORD = 'Lolok@027';

async function scrapeX() {
  let browser: Browser | null = null;
  try {
    // Launch the browser
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page: Page = await context.newPage();

    // Navigate to the X.com login page
    await page.goto('https://x.com/i/flow/login', { waitUntil: 'networkidle' });

    // Wait for the username input to appear and enter the username
    await page.waitForSelector('input[name="text"]', { timeout: 30000 });
    await page.fill('input[name="text"]', USERNAME);
    console.log('Entered username.');

    // Click the "Next" button
    await page.waitForSelector('div[data-testid="LoginForm_Login_Button"]', { timeout: 30000 });
    await page.click('div[data-testid="LoginForm_Login_Button"]');
    console.log('Clicked next button after username.');

    // Wait for the password input to appear
    await page.waitForSelector('input[name="password"]', { timeout: 30000 });
    await page.fill('input[name="password"]', PASSWORD);
    console.log('Entered password.');

    // Click the login button
    await page.waitForSelector('div[data-testid="LoginForm_Login_Button"]', { timeout: 30000 });
    await page.click('div[data-testid="LoginForm_Login_Button"]');
    console.log('Clicked login button after password.');

    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // Confirm you are logged in by checking the presence of a tweet in the timeline
    await page.waitForSelector('div[data-testid="tweet"]', { timeout: 15000 });
    console.log('Logged in successfully.');

    // Scroll through the timeline and take screenshots
    for (let i = 1; i <= 3; i++) {
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `screenshot${i}.png`, fullPage: true });
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    }

    console.log('Scraping completed successfully.');
  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Execute the scraping function
scrapeX();
