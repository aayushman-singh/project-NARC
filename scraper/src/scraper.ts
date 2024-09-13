import { Log, PlaywrightCrawler } from 'crawlee';
import * as fs from 'fs/promises';
import { insertInstagramFollowers, insertInstagramFollowing, insertInstagramTimeline } from './mongoUtils.js'; // Use ESM import
import { Page } from 'playwright';
import { PathLike } from 'fs';
const username = process.argv[2];
const password = process.argv[3];
const captureTimelineScreenshots = async (page: Page, log: Log) => {
    log.info('Capturing timeline screenshots...');
    const timelineSelector = 'section > main > div > div';  // Adjust selector based on your page structure

    try {
        await page.goto('https://www.instagram.com');
        await page.waitForSelector(timelineSelector, { timeout: 30000 });
        try {
            const notNowButtonSelector = 'button:has-text("Not Now")'; // Adjust if necessary
            await page.waitForSelector(notNowButtonSelector, { timeout: 5000 });
            await page.click(notNowButtonSelector);
            log.info('Notification pop-up dismissed successfully.');
        } catch (error) {
            log.info('Notification pop-up did not appear or was already dismissed.');
        }

            const screenshotData = [];

            for (let i = 1; i <= 3; i++) {
                await page.evaluate(() => window.scrollBy(0, window.innerHeight));  // Scroll down
                await page.waitForTimeout(2000); 
                // Capture screenshot as a buffer and convert it to base64
                const screenshotBuffer = await page.screenshot({ fullPage: false });
                const screenshotBase64 = screenshotBuffer.toString('base64');
                screenshotData.push({ screenshotNumber: i, screenshotBase64 });
            
                log.info(`Captured and converted screenshot ${i} to base64.`);
            }
            
            // Insert all screenshots into MongoDB after the loop
            await insertInstagramTimeline(username, screenshotData);
            log.info('All screenshots inserted into MongoDB.'); // Return the base64-encoded screenshots
    } catch (error) {
        log.error(`Failed to capture screenshots: ${error.message}`);
        return [];
    }
};

const scraper = async () => {
    let isLoggedIn = false;  // Variable to track login status


    if (!username || !password) {
        console.error("Username or password missing. Please provide both.");
        process.exit(1);  // Exit if username or password is not provided
    }

    const crawler = new PlaywrightCrawler({
        launchContext: {
            launchOptions: { headless: false, slowMo: 1000 }, // Non-headless mode with delay between actions
        },
        maxRequestRetries: 0,  // Disable retries
        preNavigationHooks: [
            async ({ page, log }) => {
                if (!isLoggedIn) {  // Only attempt login if not already logged in
                    log.info('Performing login...');
                    try {
                        // Go to Instagram login page
                        await page.goto('https://www.instagram.com/accounts/login/');
                        await page.waitForSelector('input[name="username"]', { timeout: 30000 });

                        // Fill in login details
                        await page.fill('input[name="username"]', username);
                        await page.fill('input[name="password"]', password);
                        log.info('Filled in login details.');

                        // Click the login button and wait for the navigation to complete
                        await Promise.all([
                            page.click('button[type="submit"]'),
                            page.waitForNavigation(),
                        ]);
                        log.info('Logged in successfully.');
                        isLoggedIn = true;  // Mark as logged in

                        // Capture screenshots of the timeline before starting scraping
                        await captureTimelineScreenshots(page, log);

                    } catch (error) {
                        log.error('Login failed or not required: ' + error.message);
                    }
                } else {
                    log.info('Already logged in.');
                }
            },
        ],
        requestHandler: async ({ request, page, log }) => {
            log.info(`Processing ${request.url}`);

            try {
                // Navigate to the profile page
                await page.goto(`https://www.instagram.com/${username}/`);
                log.info('Navigated to profile page.');

                // Scrape follower and following counts
                const followerCount = await page.$eval('a[href$="/followers/"] span', el => parseInt(el.textContent!.replace(/,/g, '')));
                const followingCount = await page.$eval('a[href$="/following/"] span', el => parseInt(el.textContent!.replace(/,/g, '')));

                log.info(`Follower count: ${followerCount}, Following count: ${followingCount}`);

                // Function to scrape followers or following
                const scrapeList = async (listType: string, selector: string, logFilePath: PathLike | fs.FileHandle, maxItems: number) => {
                    log.info(`Starting to scrape ${listType}...`);
                    await page.goto("https://www.instagram.com/")
                    await page.goto(`https://www.instagram.com/${username}/`);
                    await page.waitForSelector(selector, { timeout: 100000 });
                    await page.click(selector);
                    log.info(`Clicked on ${listType} link.`);

                    await page.waitForSelector('div[role="dialog"]', { timeout: 70000 });
                    log.info(`${listType} modal loaded.`);
        
                    let scrollAttempts = 0;
                    const maxScrollAttempts = 15;
                    const dataSet: { username: string | null; profilePicUrl: any; }[] = [];  // Store both username and profile pic URL as objects
        
                    while (scrollAttempts < maxScrollAttempts && dataSet.length < maxItems) {
                        const tiles = await page.$$('div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1pi30zi.x1swvt13.xwib8y2.x1y1aw1k.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1');
                        log.info(`Found ${tiles.length} ${listType} tiles.`);
        
                        let newItemsAdded = false;
                        for (const tile of tiles) {
                            const profilePicUrl = await tile.$eval('a > img', img => (img as HTMLImageElement).src).catch(() => 'No profile pic');
                            const username = await tile.$eval('a > div > div > span', span => span.textContent).catch(() => 'No username');
        
                            // Add unique entries and stop if max limit is reached
                            if (!dataSet.some(item => item.username === username) && dataSet.length < maxItems) {
                                dataSet.push({ username, profilePicUrl });
                                log.info(`${listType}: Username: ${username}, Profile Pic: ${profilePicUrl}`);
                                newItemsAdded = true;
                            }
        
                            if (dataSet.length >= maxItems) {
                                log.info(`Reached max ${listType} count: ${maxItems}`);
                                break;
                            }
                        }
        
                        // Scroll to the last tile if there are any
                        if (tiles.length > 0) {
                            await tiles[tiles.length - 1].scrollIntoViewIfNeeded();
                        }
        
                        // Wait for new content to load
                        await page.waitForTimeout(3000);
        
                        if (!newItemsAdded) {
                            scrollAttempts++;
                            log.info(`No new ${listType} loaded. Scroll attempt: ${scrollAttempts}`);
                        } else {
                            scrollAttempts = 0;  // Reset scroll attempts if new tiles were added
                        }
        
                        // Break if no new content was loaded after several attempts
                        if (scrollAttempts >= 3) {
                            log.info(`No new ${listType} after several attempts. Stopping scroll.`);
                            break;
                        }
                    }
        
                    // Log the data to a text file
                    const logData = dataSet.map(item => `Username: ${item.username}, Profile Pic: ${item.profilePicUrl}`).join('\n');
                    await fs.writeFile(logFilePath, logData, { flag: 'a' });
        
                    log.info(`Total ${listType} extracted and logged.`);
                    return dataSet;  // Return the dataset for MongoDB insertion
                };
        
                // Scrape followers
                try {
                    const followersData = await scrapeList('followers', `a[href="/${username}/followers/"]`, './followers_log.txt', followerCount);
                    await insertInstagramFollowers(username, followersData);
                } catch (error) {
                    log.error(`Error while scraping followers: ${error.message}. Moving on to following list.`);
                }
        
                // Scrape following
                try {
                    const followingData = await scrapeList('following', `a[href="/${username}/following/"]`, './following_log.txt', followingCount);
                    await insertInstagramFollowing(username, followingData);
                } catch (error) {
                    log.error(`Error while scraping following: ${error.message}. Moving on`);
                }

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        },
        failedRequestHandler: async ({ request, log }) => {
            log.error(`Failed to process ${request.url}. Moving on to the next task.`);
        },
    });

    await crawler.run([{ url: `https://www.instagram.com/${username}/`}]);
};

scraper();
