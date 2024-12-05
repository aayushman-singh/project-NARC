import { chromium } from "playwright";

(async () => {
    // Specify a directory for persistent context
    const userDataDir = "./user_data";

    // Launch browser with persistent context
    const browser = await chromium.launchPersistentContext(userDataDir, {
        headless: false, // Headful mode for debugging
        slowMo: 500, // Slow down actions by 500ms to simulate human interaction
    });

    // Open a new page in the persistent context
    const page = await browser.newPage();

    // Navigate to Google login
    await page.goto("https://accounts.google.com/o/oauth2/auth", {
        waitUntil: "domcontentloaded",
    });

    // Check if already logged in (via cookies or session data)
    if (await page.isVisible("#identifierId")) {
        console.log("Not logged in, proceeding with login...");

        // Hardcoded credentials for testing
        const GOOGLE_EMAIL = "kremzylo@gmail.com"; // Replace with your Google email
        const GOOGLE_PASSWORD = "gptontop"; // Replace with your Google password

        // Fill in email and navigate to the password step
        await page.fill("#identifierId", GOOGLE_EMAIL);
        await page.click("#identifierNext");

        // Wait for password input, then fill it in
        await page.waitForSelector('input[name="password"]');
        await page.fill('input[name="password"]', GOOGLE_PASSWORD);
        await page.click("#passwordNext");

        // Wait for successful login
        await page.waitForNavigation({ waitUntil: "networkidle" });
        console.log("Login successful.");
    } else {
        console.log("Already logged in, skipping login step.");
    }

    // Navigate to Google My Activity - YouTube history
    await page.goto(
        "https://myactivity.google.com/product/youtube?utm_source=my-activity",
        {
            waitUntil: "domcontentloaded",
        }
    );
    console.log("Navigated to Google My Activity.");

    // Ensure My Activity YouTube page is loaded
    await page.waitForSelector('h1:has-text("YouTube History")');
    console.log("My Activity YouTube page loaded.");

    // Add a delay to ensure the page fully renders
    await page.waitForTimeout(2000);

    // Locate and click the "Jump to date" button
    const jumpToDateButton = page.locator('button[aria-label="Jump to date"]');
    await jumpToDateButton.click();
    console.log('Clicked "Jump to date" button.');

    // Wait for the popup to appear (adjust selector if necessary)
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    console.log("Date input popup appeared.");

    // Add a delay to simulate natural input
    await page.waitForTimeout(1000);

    // Fill in the date range in dd/mm/yyyy format
    const dateInput = page.locator('input[type="text"]');
    await dateInput.fill("02/12/2024");
    console.log("Date range filled in.");

    // Click the "Apply" button
    const applyButton = page.locator('button:has-text("Apply")');
    await applyButton.click();
    console.log("Applied the date range.");

    // Add a delay for confirmation or additional interactions
    await page.waitForTimeout(2000);

    // Close the browser context (persistent data remains saved)
    await browser.close();
})();
