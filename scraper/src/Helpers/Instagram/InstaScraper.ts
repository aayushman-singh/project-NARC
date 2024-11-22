import { Log, PlaywrightCrawler } from 'crawlee';
import { insertFollowers, insertFollowing, uploadScreenshotToMongo, insertMessages, uploadChats, uploadToS3  } from '../mongoUtils.js'; // Use ESM import
import { BrowserContext, Page } from 'playwright';
import { promises as fs, PathLike } from 'fs';
import path from 'path'; // To handle file paths

const saveSession = async (page:Page, filePath: string) => {
    const storageState = await page.context().storageState();
    await fs.writeFile(filePath, JSON.stringify(storageState));
    console.log('Session data saved.');
};

const loadSession = async (browserContext:BrowserContext, filePath: string) => {
    try {
        const storageState = JSON.parse(await fs.readFile(filePath, 'utf8'));
        await browserContext.addInitScript(() => {
            window.localStorage.setItem(storageState.key, storageState.value);
        });
        console.log('Session data loaded.');
    } catch (error:any) {
        console.warn('No session data found. Starting fresh.');
    }
};

const openAllInstagramMessagesAndLog = async (page: Page, log: Log, username: string) => {
    try {
        // Navigate to Instagram Direct Inbox
        log.info('Navigating to Instagram Direct Inbox.');
        await page.goto('https://www.instagram.com/direct/inbox/', { waitUntil: 'networkidle' });
        
        // Handle "Not Now" notification pop-up
        try {
            const notNowButtonSelector = 'button:has-text("Not Now")'; // Adjust if necessary
            await page.waitForSelector(notNowButtonSelector, { timeout: 5000 });
            await page.click(notNowButtonSelector);
            log.info('Notification pop-up dismissed successfully.');
        } catch (error:any) {
            log.info('Notification pop-up did not appear or was already dismissed.');
        }

        // Correct selector for user tiles using the role="listitem"
        const userTileSelector = 'div[role="listitem"].x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x1iyjqo2';

        // Wait for user tiles to appear
        await page.waitForSelector(userTileSelector, { timeout: 60000 });

        // Extract all usernames from the chat list
        const chatUsernames = await page.evaluate(() => {
            const chatItems = document.querySelectorAll('div[role="listitem"]');
            return Array.from(chatItems).map(item => {
                const usernameElement = item.querySelector('span.x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft');
                return usernameElement ? usernameElement.textContent!.trim() : 'null';
            }).filter(Boolean); // Remove any null or undefined usernames
        });

        log.info(`Found ${chatUsernames.length} chats: ${chatUsernames.join(', ')}`);

        // Process the first 5 chats or fewer if fewer than 5 chats exist
        const chatsToProcess = chatUsernames;

        for (const chatUsername of chatsToProcess) {
            log.info(`Opening chat with: ${chatUsername}`);
            let screenshotPaths:string[] = [];
            // Click on the user's chat to open the conversation by searching for the username
            const chatClicked = await page.evaluate((usernameToClick) => {
                const chatItems = document.querySelectorAll('div[role="listitem"]');
                for (const item of chatItems) {
                    const usernameElement = item.querySelector('span.x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft');
                    if (usernameElement && usernameElement.textContent!.trim() === usernameToClick) {
                        (item as HTMLElement).click();
                        return true;
                    }
                }
                return false;
            }, chatUsername);

            if (!chatClicked) {
                console.log(`Could not find or click chat with ${chatUsername}. Skipping.`);
                continue;
            }

            await page.waitForSelector('div[role="row"]', { timeout: 30000 });
            log.info(`Chat with ${chatUsername} is now open`);

            // Scroll through the chat to load all messages
            let previousHeight = 0;
            let newHeight = await page.evaluate(() => document.querySelector('div[role="grid"]')?.scrollHeight || 0);
            while (newHeight > previousHeight) {
                previousHeight = newHeight;
                await page.evaluate(async () => {
                    const chatBox = document.querySelector('div[role="grid"]');
                    chatBox?.scrollTo(0, chatBox.scrollHeight);
                });
                await page.waitForTimeout(500);
                newHeight = await page.evaluate(() => document.querySelector('div[role="grid"]')?.scrollHeight || 0);
            }
              // Function to scroll through messages dynamically
        const scrollChat = async () => {
            let previousMessageCount = 0;
            let messageCount = 0;
            let iteration = 1;

            while (true) {
                const messages = await page.evaluate(() => {
                    const messageRows = document.querySelectorAll('div[role="row"]');
                    return Array.from(messageRows).map(row => {
                        const senderElement = row.querySelector('h5 span.xzpqnlu, h4 span.xzpqnlu');
                        const textContentElement = row.querySelector('div[dir="auto"]');
                        const mediaContentElement = row.querySelector('video, img');
    
                        let sender = 'Unknown';
                        let content = '';
    
                        if (textContentElement) {
                            content = `Text: ${textContentElement.textContent?.trim()}`;
                        }
    
                        if (mediaContentElement) {
                            if (mediaContentElement.tagName.toLowerCase() === 'video') {
                                content = 'Reel: [Video Content]';
                            } else if (mediaContentElement.tagName.toLowerCase() === 'img') {
                                content = 'Image: [Image Content]';
                            }
                        }
    
                        if (senderElement) {
                            sender = senderElement.textContent?.trim() || 'Unknown';
                        }
    
                        return { sender, content };
                    }).filter(message => message.content !== '');
                });
                messageCount = messages.length;

                console.log(`Iteration ${iteration}: Found ${messageCount} messages.`);

                if (messageCount === previousMessageCount) {
                    console.log('No new messages loaded. Stopping scrolling.');
                    break;
                }
                const limit = 50;

                for (let i = previousMessageCount; i < Math.min(messageCount, limit); i++) {
                    // Scroll to the message
                    await page.evaluate(index => {
                        const messages = document.querySelectorAll('div[role="row"]');
                        if (messages[index]) {
                            messages[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, i);

                    // Take a screenshot every 3 messages
                    if ((i + 1) % 3 === 0 || i === messageCount - 1) {
                        const screenshotPath = path.resolve(`./message_screenshot_${i + 1}.png`);
                        await page.screenshot({ path: screenshotPath, fullPage: false });
                        console.log(`Screenshot taken for message ${i + 1}: ${screenshotPath}`);
                        screenshotPaths.push(screenshotPath);
                    }
                    
                    // Wait a bit for new content to load
                    await page.waitForTimeout(1000);
                }

                previousMessageCount = messageCount;
                iteration++;

                log.info(`Number of messages found in ${chatUsername}'s chat: ${messages.length}`);
                await page.waitForTimeout(7000);
                // Log messages to a file
                const logFilePath = `./src/storage/${chatUsername}_instagram_messages.txt`;
                const messageLog = messages.map((msg, index) => `${index + 1}. ${msg.sender}: ${msg.content}`).join('\n');
                await fs.mkdir(path.dirname(logFilePath), { recursive: true }); // Ensure the directory exists
                await fs.writeFile(logFilePath, messageLog, 'utf8');
                log.info(`Messages for ${chatUsername} have been logged to ${logFilePath}`);
    
                // Take a screenshot of the chat
                const screenshotPath = path.resolve(`./${chatUsername}_instagram_screenshot.png`);
                
                
                log.info(`Screenshot of ${chatUsername}'s chat saved to ${screenshotPath}`);
                const chatLogKey = `${username}/${chatUsername}/chat_log.txt`;
                const chatLogURL = await uploadToS3(logFilePath, chatLogKey);
                console.log(`Chat log uploaded to S3: ${chatLogURL}`);
                // Upload the screenshot to MongoDB
                await uploadChats(username, chatUsername, screenshotPaths, chatLogURL, 'instagram')
                screenshotPaths = [];
                await page.waitForTimeout(2000);
            }

            console.log('Scrolling completed.');
        };

        // Call the scroll function
        await scrollChat();
           
        }

    } catch (error:any) {
        log.error(`Error while processing Instagram messages: ${error.message}`);
    }
};



const captureTimelineScreenshots = async (page: Page, log: Log, username: string) => {
    log.info('Capturing timeline screenshots...');
    const timelineSelector = 'section > main > div > div';  // Adjust selector based on your page structure

    try {
        await page.goto('https://www.instagram.com');
        await page.waitForSelector(timelineSelector, { timeout: 30000 });
        
        // Handle "Not Now" notification pop-up
        try {
            const notNowButtonSelector = 'button:has-text("Not Now")'; // Adjust if necessary
            await page.waitForSelector(notNowButtonSelector, { timeout: 5000 });
            await page.click(notNowButtonSelector);
            log.info('Notification pop-up dismissed successfully.');
        } catch (error:any) {
            log.info('Notification pop-up did not appear or was already dismissed.');
        }

        // Loop to capture and upload screenshots
        for (let i = 1; i <= 3; i++) {
            const screenshotPath = `timeline_${username}_${i}.png`;  // Generate path to save the screenshot
            await page.screenshot({ path: screenshotPath, fullPage: false });  // Capture screenshot

            await page.evaluate(() => window.scrollBy(0, window.innerHeight));  // Scroll down
            await page.waitForTimeout(2000); 

            log.info(`Captured screenshot ${i}.`);

            // Upload screenshot to MongoDB and insert reference
            await uploadScreenshotToMongo(username, screenshotPath, `timeline_${i}`, 'instagram');
            
            log.info(`Uploaded timeline screenshot ${i} to MongoDB.`);
        }
        
        log.info('All screenshots inserted into MongoDB.');
    } catch (error:any) {
        log.error(`Failed to capture screenshots: ${error.message}`);
    }
};

export const InstaScraper = async (username:string,password:string) => {
    let isLoggedIn = false;  // Variable to track login status


    if (!username || !password) {
        console.error("Username or password missing. Please provide both.");
        process.exit(1);  // Exit if username or password is not provided
    }

    const crawler = new PlaywrightCrawler({
      
        launchContext: {
          
            launchOptions: { headless: false, slowMo: 1000 ,  args: ['--enable-http2', '--tls-min-v1.2'], }, // Non-headless mode with delay between actions
        },
        requestHandlerTimeoutSecs: 500,
        maxRequestRetries: 0,  // Disable retries
        preNavigationHooks: [
            async ({ page, log }) => {
                const sessionFilePath = './session.json';
                if (!isLoggedIn) {
                    await loadSession(page.context(), sessionFilePath);
                }
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
                        await saveSession(page, sessionFilePath);
                        // Capture screenshots of the timeline before starting scraping
                        await captureTimelineScreenshots(page, log, username);

                    } catch (error:any) {
                        log.error('Login failed or not required: ' + error.message);
                    }
                } else {
                    log.info('Already logged in.');
                }
            },
        ],
        requestHandler: async ({ request, page, log }) => {
           
            log.info(`Processing ${request.url}`);
            let resultId;
            try {
                // Navigate to the profile page
                await page.goto(`https://www.instagram.com/${username}/`);
                log.info('Navigated to profile page.');

                // Scrape follower and following counts
                const followerCount = await page.$eval('a[href$="/followers/"] span', el => parseInt(el.textContent!.replace(/,/g, '')));
                const followingCount = await page.$eval('a[href$="/following/"] span', el => parseInt(el.textContent!.replace(/,/g, '')));

                log.info(`Follower count: ${followerCount}, Following count: ${followingCount}`);

                const screenshotPath = `profile_${username}.png`;  // Generate path to save the screenshot
                await page.screenshot({ path: screenshotPath, fullPage: false });  // Capture screenshot

                resultId = await uploadScreenshotToMongo(username, screenshotPath, 'profilePage', 'instagram')
                // Function to scrape followers or following
                const scrapeList = async (listType: string, selector: string, logFilePath: PathLike | fs.FileHandle, maxItems: number) => {
                    log.info(`Starting to scrape ${listType}...`);
                   
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
                    await insertFollowers(username, followersData, 'instagram');
                } catch (error:any) {
                    log.error(`Error while scraping followers: ${error.message}. Moving on to following list.`);
                }
                
                // Scrape following
                try {
                    const followingData = await scrapeList('following', `a[href="/${username}/following/"]`, './following_log.txt', followingCount);
                    await insertFollowing(username, followingData, 'instagram');
                } catch (error:any) {
                    log.error(`Error while scraping following: ${error.message}. Moving on`);
                }
                await openAllInstagramMessagesAndLog(page, log, username);
                return resultId;
            } catch (error:any) {
                log.error(`Error processing ${request.url}: ${error.message}`);
                return null;
            }
        },

        failedRequestHandler: async ({ request, log }) => {
            log.error(`Failed to process ${request.url}. Moving on to the next task.`);
        },
    });

    await crawler.run([{ url: `https://www.instagram.com/${username}/`}]);
};