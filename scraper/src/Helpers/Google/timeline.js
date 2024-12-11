import {remote} from 'webdriverio';

(async () => {
    const opts = {
        path: "/wd/hub",
        port: 4723,
        capabilities: {
            platformName: "Android",
            platformVersion: "11.0", // Adjust based on your emulator
            deviceName: "Android Emulator",
            appPackage: "com.google.android.apps.maps", // Google Maps package
            appActivity: "com.google.android.maps.MapsActivity", // Main activity
            automationName: "UiAutomator2", // Use UiAutomator2 for Android automation
            noReset: true, // Prevent clearing app data
            newCommandTimeout: 300, // Increase timeout for slow devices
        },
    };

    const client = await remote(opts);

    try {
        console.log("Launching Google Maps...");
        await client.pause(5000); // Wait for the app to load

        // Check if already signed in by detecting a known logged-in element
        const loggedInElement = await client.$("~Explore"); // Accessibility ID for the "Explore" button
        const isLoggedIn = await loggedInElement.isDisplayed();

        if (isLoggedIn) {
            console.log("Already logged in.");
        } else {
            console.log("Not logged in. Proceeding to login...");

            // Tap on "Sign In" (Assumes you start on a screen requiring login)
            const signInButton = await client.$(
                'android=new UiSelector().text("Sign in")'
            );
            await signInButton.click();

            // Fill in the email
            const emailField = await client.$("android.widget.EditText"); // Finds the first input field
            await emailField.setValue("your_email@example.com");
            console.log("Entered email.");

            // Click "Next"
            const nextButton = await client.$(
                'android=new UiSelector().text("Next")'
            );
            await nextButton.click();
            await client.pause(2000);

            // Fill in the password
            const passwordField = await client.$("android.widget.EditText"); // Finds the next input field
            await passwordField.setValue("your_password");
            console.log("Entered password.");

            // Click "Sign in"
            const loginButton = await client.$(
                'android=new UiSelector().text("Sign in")'
            );
            await loginButton.click();
            console.log("Logged in successfully.");
        }

        // Wait for Maps to load the main interface
        await client.pause(5000);

        console.log("Google Maps is ready.");
    } catch (error) {
        console.error("Error occurred:", error);
    } finally {
        await client.deleteSession();
        console.log("Session closed.");
    }
})();
