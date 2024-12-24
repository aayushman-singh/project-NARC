import { remote } from "webdriverio";
import { loginInstagram } from "./instagram/login.ts";

async function startScraper() {
  const driver = await remote({
    hostname: "localhost",
    port: 4723,
    capabilities: {
      platformName: "Android",
      "appium:automationName": "UiAutomator2",
      "appium:deviceName": "emulator-5554",
      "appium:appPackage": "com.instagram.android",
      "appium:appActivity": "com.instagram.android.activity.MainTabActivity",
      "appium:noReset": true,
      "appium:autoLaunch": true,
    },
  });

  try {
    // Ensure app is launched and wait for it
    await driver.activateApp("com.instagram.android");
    await driver.pause(5000); // Wait for app to fully load

    // Log current activity to debug
    const currentPackage = await driver.getCurrentPackage();
    const currentActivity = await driver.getCurrentActivity();
    console.log("Current Package:", currentPackage);
    console.log("Current Activity:", currentActivity);

    if (
      await driver
        .$(
          'xpath://android.widget.Button[@content-desc="Log in"]/android.view.ViewGroup',
        )
        .isDisplayed()
    ) {
      await loginInstagram(driver);
    } else {
      console.log("Already logged in or different state");
    }
    if (
      await driver
        .$(
          `android=new UiSelector().description("Save")
    `,
        )
        .isDisplayed()
    ) {
      await driver
        .$(
          `android=new UiSelector().description("Save")
    `,
        )
        .click();
    }
      await driver.pause(3000);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await driver.deleteSession();
  }
}

startScraper().catch(console.error);
