import { remote } from "webdriverio";

async function startScraper() {
  const driver = await remote({
    hostname: "localhost",
    port: 4723,
    capabilities: {
      platformName: "Android",
      "appium:automationName": "UiAutomator2",
      "appium:deviceName": "Android Device",
      "appium:appPackage": "com.instagram.android",
      "appium:appActivity": "com.instagram.mainactivity.MainActivity",
      "appium:noReset": true,
    },
  });

  try {
    // Wait for and click login button
    const loginButton = await driver.$("~login_button");
    await loginButton.waitForDisplayed({ timeout: 5000 });
    await loginButton.click();

    // Enter credentials
    const usernameField = await driver.$("~username_field");
    await usernameField.setValue("your_username");

    const passwordField = await driver.$("~password_field");
    await passwordField.setValue("your_password");

    // Submit login
    const submitButton = await driver.$("~next_button");
    await submitButton.click();

    // Wait a bit to see if login was successful
    await driver.pause(5000);

    console.log("Basic login flow completed");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await driver.deleteSession();
  }
}

startScraper().catch(console.error);
