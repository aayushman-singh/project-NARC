import { remote } from "webdriverio";
import type { Browser } from "webdriverio";

export interface AppiumConfig  {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Android Device',
      'appium:appPackage': 'com.instagram.android',
      'appium:appActivity': 'com.instagram.mainactivity.MainActivity',
      'appium:noReset': true
    }

export class AppiumService {
  private static instance: AppiumService;
  private driver: Browser | null = null;

  private constructor() {}

  static getInstance(): AppiumService {
    if (!AppiumService.instance) {
      AppiumService.instance = new AppiumService();
    }
    return AppiumService.instance;
  }

  async initializeDriver(config: AppiumConfig): Promise<Browser> {
    if (!this.driver) {
      this.driver = await remote({
        hostname: "localhost",
        port: 4723,
        capabilities: config,
        waitforTimeout: 10000,
      });
    }
    return this.driver;
  }

  async closeDriver(): Promise<void> {
    if (this.driver) {
      await this.driver.deleteSession();
      this.driver = null;
    }
  }

  getDriver(): Browser | null {
    return this.driver;
  }
}
