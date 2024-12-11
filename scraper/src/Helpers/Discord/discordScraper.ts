import { chromium } from 'playwright';

(async () => {
    // Launch the browser
    const browser = await chromium.launch({ headless: false }); // Set to true for headless mode
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to Discord login page
    await page.goto("https://discord.com/login");

    // Wait for the email/phone number input field to appear
    await page.waitForSelector('input[name="email"]');

    // Enter the hardcoded email or phone number
    const emailOrPhoneNumber = "kremzylo@gmail.com";
    const password = "trash027"; // Replace with your password

    await page.fill('input[name="email"]', emailOrPhoneNumber);

    // Wait for the password input field to appear and enter the password
    await page.waitForSelector('input[name="password"]');
    await page.fill('input[name="password"]', password);

    // Click the Login button
    await page.click('button[type="submit"]');

    // Wait for navigation or a specific element to confirm successful login
    try {
        await page.waitForNavigation({ timeout: 10000 }); // Adjust timeout if necessary
        console.log("Login successful");
    } catch (e) {
        console.error("Login failed or took too long");
    }

    // Look through DMs
    await page.waitForSelector('ul[role="list"][aria-label="Direct Messages"]');
    const dmsList = await page.$(
        'ul[role="list"][aria-label="Direct Messages"]'
    );

    if (dmsList) {
        const dmItems = await dmsList.$$("li");
        for (let i = 2; i < dmItems.length; i++) {
            // Skip the first two items
            const dmItem = dmItems[i];
            const link = await dmItem.$("a[aria-label]");

            if (link) {
                const recipientUsername = await link.getAttribute("aria-label");
                const chatLink = await link.getAttribute("href");
                console.log("Recipient username:", recipientUsername);
                console.log("Chat link:", chatLink);
            }
        }
    }

    // Select the "Servers" section
    await page.waitForSelector('div[aria-label="Servers"]');
    const serversSection = await page.$('div[aria-label="Servers"]');

    // Iterate through each child div with role "listitem"
    const serverItems = await serversSection.$$('div[role="listitem"]');
    for (const serverItem of serverItems) {
        // Extract and log the img src
        const img = await serverItem.$("img");
        if (img) {
            const src = await img.getAttribute("src");
            console.log("Server image src:", src);
        }

        // Click on the server item
        await serverItem.click();

        // Add a small delay to observe the click action (if needed)
        await page.waitForTimeout(500);
    }

    // Close the browser
    await browser.close();
})();
