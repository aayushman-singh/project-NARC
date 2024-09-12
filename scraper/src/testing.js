import { PlaywrightCrawler } from 'crawlee';
import * as fs from 'fs/promises';


const scraper = async () => {
    const crawler = new PlaywrightCrawler({
        launchContext: {
            launchOptions: { headless: false, slowMo: 500 }, // Non-headless mode with delay between actions
        },
        requestHandler: async ({ request, page, log }) => {
            log.info(`Processing ${request.url}`);

            try {
                // Step 1: Go to Instagram login page
                await page.goto('https://www.instagram.com/accounts/login/');
                
                // Step 2: Wait for the login form and fill in credentials
                await page.waitForSelector('input[name="username"]', { timeout: 30000 });
                log.info('Login page loaded.');

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

                // Step 3: Navigate to the profile page
                await page.goto('https://www.instagram.com/aayushman027/');
                log.info('Navigated to profile page.');

                // Function to scrape either "followers" or "following"
                const scrapeList = async (linkSelector, logFilePath, listType) => {
                    // Step 4: Wait for the link (followers/following) and click it
                    await page.waitForSelector(linkSelector, { timeout: 100000 });
                    await page.click(linkSelector);
                    log.info(`Clicked on the ${listType} link.`);

                    // Step 5: Wait for the modal to fully load
                    log.info(`Waiting for the ${listType} modal to load...`);
                    await page.waitForSelector('div[role="dialog"]', { timeout: 60000 });

                    log.info(`${listType} modal loaded.`);

                    // Step 6: Scroll and extract follower details
                    let previousCount = 0;
                    let totalFollowers = 0;
                    let scrollAttempts = 0;
                    const maxScrollAttempts = 15;  // Maximum number of scrolls before stopping
                    const followersData = [];

                    while (scrollAttempts < maxScrollAttempts) {
                        // Select all visible tiles
                        const followerTiles = await page.$$('div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1pi30zi.x1swvt13.xwib8y2.x1y1aw1k.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1');
                        
                        totalFollowers = followerTiles.length;
                        log.info(`Number of ${listType} tiles found: ${totalFollowers}`);

                        // Extract data from each tile
                        for (const tile of followerTiles) {
                            const profilePicUrl = await tile.$eval('a > img', img => img.src).catch(() => 'No profile pic');
                            const username = await tile.$eval('a > div > div > span', span => span.textContent).catch(() => 'No username');
                            followersData.push({ username, profilePicUrl });
                            log.info(`${listType} Username: ${username}, Profile Pic: ${profilePicUrl}`);
                        }

                        // Scroll to the last tile
                        if (followerTiles.length > 0) {
                            log.info('Scrolling to the last tile...');
                            await followerTiles[followerTiles.length - 1].scrollIntoViewIfNeeded();
                        }

                        // Wait for 2 seconds for more data to load
                        await page.waitForTimeout(2000);

                        // Check if any new tiles loaded
                        if (totalFollowers === previousCount) {
                            scrollAttempts++;
                            log.info(`No new ${listType} loaded. Scroll attempt: ${scrollAttempts}`);
                        } else {
                            scrollAttempts = 0;  // Reset scroll attempts if new tiles are loaded
                        }

                        previousCount = totalFollowers;
                    }

                    // Log the data to a text file
                    const logData = followersData.map(f => `Username: ${f.username}, Profile Pic: ${f.profilePicUrl}`).join('\n');
                    await fs.writeFile(logFilePath, logData, { flag: 'a' });

                    log.info(`Total ${listType} extracted: ${followersData.length}`);
                };

                // Scrape followers first
                await scrapeList('a[href="/aayushman027/followers/"]', './followers_log.txt', 'followers');

                // Close the modal after followers are scraped
                await page.click('body'); // Clicking outside the modal to close it
                log.info('Closed the followers modal.');

                // Scrape following next
                await scrapeList('a[href="/aayushman027/following/"]', './following_log.txt', 'following');

            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        },
    });

    await crawler.run([{ url: 'https://www.instagram.com/aayushman027/' }]);
};

scraper();
