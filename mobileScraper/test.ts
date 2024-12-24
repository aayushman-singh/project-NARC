import { remote } from "webdriverio";

async function loginInstagram(username: string, password: string) {
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
    const usernameField = await driver.$(
      'android=new UiSelector().className("android.widget.EditText").instance(0)',
    );
    await usernameField.setValue(username);

    const passwordField = await driver.$(
      'android=new UiSelector().className("android.widget.EditText").instance(1)',
    );
    await passwordField.setValue(password);

    console.log("Credentials entered successfully");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await driver.deleteSession();
  }
}

loginInstagram("aayushman3260", "testing@1").catch(console.error);
