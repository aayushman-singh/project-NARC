import { chromium, Browser, Page } from 'playwright';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { insertFollowers, insertPosts, uploadScreenshotToMongo } from '../mongoUtils';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path, {dirname} from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Use the stealth plugin to avoid detection

puppeteer.use(StealthPlugin());


// Random delay between actions to mimic human behavior
function randomDelay(min: number, max: number) {
  return new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
}

export async function scrapeFacebook( email: string, password: string, pin: string, limit: number) {
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
    let resultId;
    for (let i = 1; i <= 3; i++) {
      await randomDelay(2000, 4000); // Random delay between 2-4 seconds
      const screenshotPath = `facebook_screenshot_${i}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Took screenshot ${i}.`);


      await uploadScreenshotToMongo(username, screenshotPath, `timeline_${i}`, 'facebook');
      // Add ObjectId to the user's search history


      // Scroll down the page after each screenshot
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      console.log(`Scrolled down the page after screenshot ${i}.`);
    }   
    // Wait for the profile page to load
   try {
    await page.goto("https://www.facebook.com/me/")

    const screenshotPath = `profile_page.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });
    resultId = await uploadScreenshotToMongo(username, screenshotPath, `profile`, 'facebook');
    // Extract profile page
    await page.goto(`https://www.facebook.com/${username}/friends`)

    await page.waitForSelector('xpath=/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]');

    // Use XPath to select all user tiles
    const userTiles = await page.$$('xpath=/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div/div/div[4]/div/div/div/div[1]/div/div/div/div/div[3]/div[1]');

    console.log(`Total user tiles found: ${userTiles.length}`);

    const usersData = [];

    // Loop through each user tile
    for (const [index, userTile] of userTiles.entries()) {
        // Extract the profile picture URL
        const profilePicUrl = await userTile.$eval('div:nth-child(1) a img', img => (img as HTMLImageElement).src).catch(() => 'Profile picture not found');

        // Extract the user name
        const userName = await userTile.$eval('div:nth-child(2) a', a => a.textContent.trim()).catch(() => 'Name not found');

        // Extract the profile URL
        const profileUrl = await userTile.$eval('div:nth-child(2) a', a => (a as HTMLAnchorElement).href).catch(() => 'Profile URL not found');

        // Push the data into the array
        usersData.push({
            index: index + 1,
            userName,
            profilePicUrl,
            profileUrl,
        });
    }

    // Log the collected data
    console.log('Extracted Friend Data:', usersData);

    insertFollowers(username, usersData, 'facebook')
   } catch (error) {
    console.log(`Friend list scraping failed:${error}`)
   }
// Wait for the post container using XPath
const xpath = '/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div/div/div[4]/div[2]/div/div[2]/div[3]';
await page.waitForSelector('xpath=' + xpath);

const postsContainer = await page.$('xpath=' + xpath);

if (postsContainer) {
    console.log('Posts container found');

    // Get all direct child divs representing posts
    const postDivs = await page.evaluate(container => {
        return Array.from(container.children).map((_, index) => index + 1);
    }, postsContainer);

    if (postDivs.length > 0) {
      console.log(`Found ${postDivs.length} post(s).`);
      
      const scrapedPosts = [];
  
      for (let i = 0; i < Math.min(limit, postDivs.length); i++) {
          const postXPath = `${xpath}/div[${postDivs[i]}]`;
          const postElement = await page.$('xpath=' + postXPath);
  
          if (postElement) {
              // Scroll to the post and wait for it to load
              await page.evaluate(el => el.scrollIntoView(), postElement);
              await page.waitForTimeout(500); // Wait for smooth scrolling and rendering
  
              // Take a screenshot of the post
              const screenshotPath = path.join(__dirname, `post_${i + 1}.png`);
              await postElement.screenshot({ path: screenshotPath });
              console.log(`Screenshot for post ${i + 1} taken.`);
  
              // Add the post data to the scrapedPosts array
              scrapedPosts.push({
                  screenshotPath, // Path to the screenshot
                  timestamp: new Date().toISOString(), // Add a timestamp for the post
                  postIndex: i + 1 // Add an index or any other metadata
              });
  
              // Optionally, remove the screenshot file after processing
              fs.unlinkSync(screenshotPath);
          } else {
              console.log(`Post ${i + 1} not found.`);
          }
      }
  
      // Insert the posts into MongoDB
      if (scrapedPosts.length > 0) {
          await insertPosts(username, scrapedPosts, 'facebook');
          console.log(`All scraped posts uploaded to MongoDB for user: ${username}`);
      } else {
          console.log('No valid posts to upload.');
      }
  } else {
      console.log('No posts found within the container.');
  }
  
} else {
    console.log('Posts container not found.');
}


{
page.goto('https://facebook.com/messages', { timeout:8000 });

await page.waitForTimeout(5000);
const pinSelector = '#mw-numeric-code-input-prevent-composer-focus-steal';
const pinCode = pin; // Replace with your actual PIN

// Check if the input field exists without waiting for a timeout
const pinInput = await page.$(pinSelector);

if (pinInput) {
  // Type the PIN into the input field if it exists
  await pinInput.type(pinCode);
  console.log('PIN entered successfully.');
} else {
  console.log('PIN input field not found, moving on.');
}


// Wait for the container to load
await page.waitForSelector('div[aria-label="Chats"]');
console.log('Chats container loaded.');

// Find the container and all <a> tags with aria-current attribute
const chatLinks = await page.evaluateHandle(() => {
  const container = document.querySelector('div[aria-label="Chats"]');
  if (container) {
    return container.querySelectorAll('a[aria-current]');
  }
  return null;
});

if (!chatLinks) {
  console.log('No chat links found.');
  return;
}

const elements = await chatLinks.getProperties();
const chatElements = Array.from(elements.values()).filter((el) => el.asElement());
console.log(`Found ${chatElements.length} chat link(s) with the aria-current attribute.`);

// Iterate through each chat link and perform actions
for (let i = 0; i < chatElements.length; i++) {
  const chatElement = chatElements[i].asElement();

  // Click the element and log it
  await chatElement!.click();
  console.log(`Clicked on chat link ${i + 1}.`);

  // Wait for a short delay to let the page load
  await page.waitForTimeout(2000); // Adjust as necessary

  // Take a screenshot and save it with a unique name
  const screenshotPath = path.join(__dirname, `chat_${i + 1}_screenshot.png`);
  await page.screenshot({ path: screenshotPath });
  await uploadScreenshotToMongo(username, screenshotPath, 'message', 'facebook');
  console.log(`Screenshot for chat ${i + 1} taken and saved as ${screenshotPath}.`);

  // Optionally, release the handle after each interaction
  chatElement!.dispose();
}

// Navigate to the download page
await page.goto('https://www.facebook.com/secure_storage/dyi');
await page.waitForTimeout(2000); // Delay to simulate human-like behavior

// Wait for the button with aria-label="Download file"
await page.waitForSelector('div[aria-label="Download file"]');

// Click on the button
await page.evaluate(() => {
  const button = document.querySelector('div[aria-label="Download file"]');
  if (button) {
    (button as HTMLElement).click();
    console.log('Clicked on the Download file button.');
  } else {
    console.log('Download file button not found.');
  }
});
await page.waitForTimeout(2000); // Delay after clicking

// Wait for the password input field to appear
await page.waitForSelector('input[type="password"]');

// Type the password and log it
await page.type('input[type="password"]', password, { delay: 1000 }); // Adjust delay as needed
console.log('Password typed in.');
await page.waitForTimeout(1000); // Delay after typing

// Wait for the Confirm button and click it
await page.waitForSelector('div[aria-label="Confirm"]');
console.log('Confirm button found.');
await page.evaluate(() => {
  const confirmButton = document.querySelector('div[aria-label="Confirm"]');
  if (confirmButton) {
    (confirmButton as HTMLElement).click();
    console.log('Clicked the Confirm button.');
  } else {
    console.log('Confirm button not found.');
  }
});
await page.waitForTimeout(2000); // Delay to simulate human interaction

// Wait for the Download button and click it
await page.waitForSelector('div[aria-label="Download"]');
console.log('Download button found.');
await page.evaluate(() => {
  const downloadButton = document.querySelector('div[aria-label="Download"]');
  if (downloadButton) {
    (downloadButton as HTMLElement).click();
    console.log('Clicked the Download button.');
  } else {
    console.log('Download button not found.');
  }
});
await page.waitForTimeout(3000); // Delay to allow the download to initiate

}
    console.log('Completed taking screenshots.');
    return resultId;
  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}