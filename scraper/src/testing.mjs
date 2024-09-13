import { PlaywrightCrawler } from 'crawlee';
import * as fs from 'fs/promises';


const captureTimelineScreenshots = async (page, log) => {
    log.info('Capturing timeline screenshots...');

    // Wait for the timeline element to load
    const timelineSelector = 'section > main > div > div';  // Adjust based on actual timeline selector

    try {
        await page.goto('https://www.instagram.com')
        await page.waitForSelector(timelineSelector, { timeout: 30000 });
        try {
            // Wait for the notification pop-up and click the "Not Now" button if it appears
            const notNowButtonSelector = 'button:has-text("Not Now")'; // Adjust if necessary
    
            await page.waitForSelector(notNowButtonSelector, { timeout: 5000 }); // Wait for up to 5 seconds
            await page.click(notNowButtonSelector);
            log.info('Notification pop-up dismissed successfully.');
        } catch (error) {
            log.info('Notification pop-up did not appear or was already dismissed.');
        }

        // Take the first screenshot
        await page.screenshot({ path: 'timeline_screenshot_1.png', fullPage: false });
        log.info('Captured first screenshot.');

        // Scroll down and take another screenshot
        for (let i = 2; i <= 3; i++) {
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));  // Scroll down
            await page.waitForTimeout(2000);  // Wait for the page to load after scrolling
            await page.screenshot({ path: 'screenshots/timeline_screenshot_1.png', fullPage: false });
await page.screenshot({ path: 'screenshots/timeline_screenshot_2.png', fullPage: false });
await page.screenshot({ path: 'screenshots/timeline_screenshot_3.png', fullPage: false });

            log.info(`Captured screenshot ${i}.`);
        }
    } catch (error) {
        log.error(`Failed to capture screenshots: ${error.message}`);
    }
};

const scraper = async () => {
    let isLoggedIn = false;  // Variable to track login status

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
                        await page.fill('input[name="username"]', 'aayushman3260');
                        await page.fill('input[name="password"]', 'Lolok@027');
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
                await page.goto('https://www.instagram.com/aayushman3260/');
                log.info('Navigated to profile page.');

                // Scrape follower and following counts
                const followerCount = await page.$eval('a[href$="/followers/"] span', el => parseInt(el.textContent.replace(/,/g, '')));
                const followingCount = await page.$eval('a[href$="/following/"] span', el => parseInt(el.textContent.replace(/,/g, '')));

                log.info(`Follower count: ${followerCount}, Following count: ${followingCount}`);

                // Function to scrape followers or following
                const scrapeList = async (listType, selector, logFilePath, maxItems) => {
                    log.info(`Starting to scrape ${listType}...`);
                    await page.waitForSelector(selector, { timeout: 100000 });
                    await page.click(selector);
                    log.info(`Clicked on ${listType} link.`);

                    await page.waitForSelector('div[role="dialog"]', { timeout: 70000 });
                    log.info(`${listType} modal loaded.`);

                    let scrollAttempts = 0;
                    const maxScrollAttempts = 15;
                    const dataSet = new Set();  // Track unique usernames

                    while (scrollAttempts < maxScrollAttempts && dataSet.size < maxItems) {
                        const tiles = await page.$$('div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1pi30zi.x1swvt13.xwib8y2.x1y1aw1k.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1');
                        log.info(`Found ${tiles.length} ${listType} tiles.`);

                        let newItemsAdded = false;
                        for (const tile of tiles) {
                            const profilePicUrl = await tile.$eval('a > img', img => img.src).catch(() => 'No profile pic');
                            const username = await tile.$eval('a > div > div > span', span => span.textContent).catch(() => 'No username');

                            // Add unique usernames and stop if max limit is reached
                            if (!dataSet.has(username) && dataSet.size < maxItems) {
                                dataSet.add(username);
                                log.info(`${listType}: Username: ${username}, Profile Pic: ${profilePicUrl}`);
                                newItemsAdded = true;
                            }

                            if (dataSet.size >= maxItems) {
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

                        // Break if no new content was loaded after multiple attempts
                        if (scrollAttempts >= 3) {
                            log.info(`No new ${listType} after several attempts. Stopping scroll.`);
                            break;
                        }
                    }

                    // Log the data to a text file
                    const logData = Array.from(dataSet).map(username => `Username: ${username}`).join('\n');
                    await fs.writeFile(logFilePath, logData, { flag: 'a' });

                    log.info(`Total ${listType} extracted and logged.`);
                };

                // Scrape followers using the scraped follower count as the limit
                try {
                    await scrapeList('followers', 'a[href="/aayushman3260/followers/"]', './followers_log.txt', followerCount);
                } catch (error) {
                    log.error(`Error while scraping followers: ${error.message}. Moving on to following list.`);
                }

                // After scraping followers, navigate back to the profile page
                await page.goto('https://www.instagram.com/aayushman3260/');
                log.info('Navigated back to profile page.');

                // Scrape following using the scraped following count as the limit
                try {
                    await scrapeList('following', 'a[href="/aayushman3260/following/"]', './following_log.txt', followingCount);
                } catch (error) {
                    log.error(`Error while scraping following: ${error.message}. Moving on.`);
                }

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        },
        failedRequestHandler: async ({ request, log }) => {
            log.error(`Failed to process ${request.url}. Moving on to the next task.`);
            // No retries, just logging the failure and moving on
        },
    });

    await crawler.run([{ url: 'https://www.instagram.com/aayushman3260/' }]);
};

scraper();
