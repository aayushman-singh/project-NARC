import { Browser, Page, firefox, BrowserContext } from "playwright";
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userDataDir = path.join(__dirname, "playwright-user-data");
const storageStatePath = path.join(userDataDir, "state.json");

// Ensure the userDataDir exists
if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
    console.log(`Directory created: ${userDataDir}`);
} else {
    console.log(`Directory already exists: ${userDataDir}`);
}

interface AuthenticationCredentials {
    email: string;
    password: string;
}

class GmailOAuthAutomator {
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private page: Page | null = null;

    async authenticateGmailOAuth(email: string, password: string) {
        // Launch browser
        this.browser = await firefox.launch({
            headless: false, // set to true for production
            slowMo: 500, // slow down interactions for debugging
        });

        try {
            // Create a new browser context
            this.context = await this.browser.newContext({
                viewport: { width: 1280, height: 800 },
                storageState: fs.existsSync(storageStatePath)
                    ? storageStatePath
                    : undefined,
            });
            this.page = await this.context.newPage();

            // Navigate to the local OAuth endpoint
            await this.page.goto("http://localhost:3006/");

            // Wait for Google Sign-In page
            await this.page.waitForURL("**/accounts.google.com/**", {
                timeout: 15000,
            });

            // Enter email and click "Next"
            await this.page.fill('input[type="email"]', email);
            await this.page.click('button:has-text("Next")');

            // Wait for password page and fill it in
            await this.page.waitForSelector('input[type="password"]', {
                timeout: 10000,
            });
            await this.page.fill('input[type="password"]', password);
            await this.page.click('button:has-text("Next")');

            // Wait for permissions page (if applicable)
            try {
                await this.page.waitForSelector('button:has-text("Allow")', {
                    timeout: 10000,
                });
                await this.page.click('button:has-text("Allow")');
            } catch {
                console.log("No additional permissions page encountered.");
            }

            // Wait for redirect back to localhost
            const response = await this.page.waitForURL(
                "http://localhost:3006/oauth2callback*",
                {
                    timeout: 20000,
                }
            );

            // Save the storage state for future use
            await this.context.storageState({ path: storageStatePath });

            return {
                url: response.url(),
                success: true,
            };
        } catch (error) {
            console.error("Authentication failed:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        } finally {
            // Close browser
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
                this.page = null;
                this.context = null;
            }
        }
    }
}

// Express server to handle POST requests
function startAuthServer() {
    const app = express();
    const automator = new GmailOAuthAutomator();

    // Parse JSON request bodies
    app.use(bodyParser.json());

    // Endpoint to trigger Gmail OAuth
    app.post("/trigger-gmail-oauth", async (req, res) => {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        try {
            // Perform OAuth authentication
            const result = await automator.authenticateGmailOAuth(
                email,
                password
            );

            if (result.success) {
                res.json({
                    success: true,
                    message: "Authentication successful.",
                    redirectUrl: result.url,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Authentication failed.",
                    error: result.error,
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Internal server error.",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });

    // Start the server
    const PORT = 3007;
    app.listen(PORT, () => {
        console.log(`Authentication trigger server running on port ${PORT}`);
    });
}

// Run the server
startAuthServer();

export { GmailOAuthAutomator };
