export const loginInstagram = async (driver: WebdriverIO.Browser, username: string, password: string) => {
  try {
    const usernameField = await driver.$(
      'android=new UiSelector().className("android.widget.EditText").instance(0)',
    );
    await usernameField.waitForExist({ timeout: 10000 });
    await usernameField.setValue(username);

    await driver.pause(2000);

    const passwordField = await driver.$(
      'android=new UiSelector().className("android.widget.EditText").instance(1)',
    );
    await passwordField.setValue(password);

    console.log("Login data entered");
    await driver.pause(2000);
    const loginButton = await driver.$(
      `android=new UiSelector().className("android.view.ViewGroup").instance(15)`,
    );
    await loginButton.click();
    console.log("Login button pressed");
  } catch (error) {
    console.log("Error during login: " + error);
  }
};
