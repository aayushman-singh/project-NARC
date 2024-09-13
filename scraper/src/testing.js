import { PlaywrightCrawler } from 'crawlee';
import * as fs from 'fs/promises';

const scraper = async () => {
    let isLoggedIn = false;  // Variable to track login status

    const crawler = new PlaywrightCrawler({
        launchContext: {
            launchOptions: { headless: false, slowMo: 500 }, // Non-headless mode with delay between actions
        },
        preNavigationHooks: [
            async ({ page, log }) => {
                if (!isLoggedIn) {  // Only attempt login if not already logged in
                    log.info('Performing login...');
                    try {
                        // Go to Instagram login page
                        await page.goto('https://www.instagram.com/accounts/login/');
                        await page.waitForSelector('input[name="username"]', { timeout: 30000 });

                        // Fill in login details
                        await page.fill('input[name="username"]', 'aayushman027');
                        await page.fill('input[name="password"]', 'Lolok@027');
                        log.info('Filled in login details.');

                        // Click the login button and wait for the navigation to complete
                        await Promise.all([
                            page.click('button[type="submit"]'),
                            page.waitForNavigation(),
                        ]);
                        log.info('Logged in successfully.');
                        isLoggedIn = true;  // Mark as logged in
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
                await page.goto('https://www.instagram.com/aayushman027/');
                log.info('Navigated to profile page.');

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

                // Scrape followers with a limit of 215
                try {
                    await scrapeList('followers', 'a[href="/aayushman027/followers/"]', './followers_log.txt', 215);
                } catch (error) {
                    log.error(`Error while scraping followers: ${error.message}. Moving on to following list.`);
                }

                // After scraping followers, navigate back to the profile page
                await page.goto('https://www.instagram.com/aayushman027/');
                log.info('Navigated back to profile page.');

                // Scrape following with a limit of 500
                try {
                    await scrapeList('following', 'a[href="/aayushman027/following/"]', './following_log.txt', 500);
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

    await crawler.run([{ url: 'https://www.instagram.com/aayushman027/' }]);
};

scraper();
