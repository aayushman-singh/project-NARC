import { remote } from "webdriverio";
import { loginInstagram } from "./instagram/login.ts";
import { uploadScreenshotToMongo } from './utils/mongoUtils.ts';
import { profileScraping } from "./instagram/profile.ts";

let username = 'aayushman3260';
let password = 'testing@27';

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
    await driver.activateApp("com.instagram.android");
    await driver.pause(5000);

    const currentPackage = await driver.getCurrentPackage();
    const currentActivity = await driver.getCurrentActivity();
    console.log("Current Package:", currentPackage);
    console.log("Current Activity:", currentActivity);

    // First check if element exists before checking isDisplayed
    const loginButton = await driver.$(
      'xpath://android.widget.Button[@content-desc="Log in"]/android.view.ViewGroup',
    );
    if (await loginButton.isExisting()) {
      if (await loginButton.isDisplayed()) {
        await loginInstagram(driver, username, password);
      }
    } else {
      console.log("Already logged in or different state");
    }

    // Same for the Save button
    const saveButton = await driver.$(
      'android=new UiSelector().description("Save")',
    );
    if (await saveButton.isExisting()) {
      if (await saveButton.isDisplayed()) {
        await saveButton.click();
      }
    }
    await driver.pause(3000);
    const newDeviceButton = await driver.$(
      `android=new UiSelector().text("Set up on new device")`,
    );
    if (await newDeviceButton.isExisting()) {
      if (await newDeviceButton.isDisplayed()) {
        // Wait for the Skip button before clicking
        const skipButton = await driver.$(
          `android=new UiSelector().description("Skip")`,
        );
        await skipButton.waitForExist();
        await skipButton.click();
      }
    }
    await driver.pause(3000);
    const profileTabButton = driver.$(
      `android=new UiSelector().resourceId("com.instagram.android:id/profile_tab")`
    );
    await profileTabButton.isDisplayed();
    await profileTabButton.click();
    const profilePage = await driver.takeScreenshot();
    uploadScreenshotToMongo(username, profilePage, 'profilePage', 'instagramMobile');

    await profileScraping(driver, username);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await driver.deleteSession();
  }
}

startScraper().catch(console.error);
