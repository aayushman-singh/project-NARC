import { Page } from "playwright";
import path, { dirname } from "path";
import { uploadScreenshotToMongo } from "../mongoUtils";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function scrapeFacebookChats(
    page: Page,
    username: string,
    pin: any,

) {
    try {
      page.goto("https://facebook.com/messages", { timeout: 8000 });

      await page.waitForTimeout(5000);
      const pinSelector = "#mw-numeric-code-input-prevent-composer-focus-steal";
      const pinCode = pin; // Replace with your actual PIN

      // Check if the input field exists without waiting for a timeout
      const pinInput = await page.$(pinSelector);

      if (pinInput) {
          // Type the PIN into the input field if it exists
          await pinInput.type(pinCode);
          console.log("PIN entered successfully.");
      } else {
          console.log("PIN input field not found, moving on.");
      }

      // Wait for the container to load
      await page.waitForSelector('div[aria-label="Chats"]');
      console.log("Chats container loaded.");

      // Find the container and all <a> tags with aria-current attribute
      const chatLinks = await page.evaluateHandle(() => {
          const container = document.querySelector('div[aria-label="Chats"]');
          if (container) {
              return container.querySelectorAll("a[aria-current]");
          }
          return null;
      });

      if (!chatLinks) {
          console.log("No chat links found.");
          return;
      }

      const elements = await chatLinks.getProperties();
      const chatElements = Array.from(elements.values()).filter((el) =>
          el.asElement()
      );
      console.log(
          `Found ${chatElements.length} chat link(s) with the aria-current attribute.`
      );

      // Iterate through each chat link and perform actions
      for (let i = 0; i < chatElements.length; i++) {
          const chatElement = chatElements[i].asElement();

          // Click the element and log it
          await chatElement!.click();
          console.log(`Clicked on chat link ${i + 1}.`);

          // Wait for a short delay to let the page load
          await page.waitForTimeout(200000); // Adjust as necessary

          // Take a screenshot and save it with a unique name
          const screenshotPath = path.join(
              __dirname,
              `chat_${i + 1}_screenshot.png`
          );
          await page.screenshot({ path: screenshotPath });
          await uploadScreenshotToMongo(
              username,
              screenshotPath,
              "message",
              "facebook"
          );
          console.log(
              `Screenshot for chat ${
                  i + 1
              } taken and saved as ${screenshotPath}.`
          );

          // Optionally, release the handle after each interaction
          chatElement!.dispose();
      }

    } catch (error) {
        console.error("Error during Facebook chat processing:", error);
    }
}
