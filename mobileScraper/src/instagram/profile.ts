import { InstagramProfile, insertInstagramProfile } from "../utils/mongoUtils";

export const profileScraping = async (
    driver: WebdriverIO.Browser,
    username: string
) => {
    try {
        // Initialize base profile with required fields
        const baseProfile: InstagramProfile = {
            isUserAvailable: true,
            id: "", // Will be populated later
            username,
            fullName: "",
            profilePicUrl: "",
            mediaCount: 0,
            followerCount: 0,
            followingCount: 0,
            biography: "",
            externalUrl: "",
            totalIgtvVideos: 0,
            hasVideos: false,
            totalClipsCount: 0,
            hasGuides: false,
            bioLinks: [],
            isBusiness: false,
        };

        // Get followers count
        const followersElement = await driver.$(
            `android=new UiSelector().resourceId("com.instagram.android:id/row_profile_header_textview_followers_count")`
        );
        baseProfile.followerCount = parseInt(await followersElement.getText());

        // Click followers to open the list
        await driver
            .$(
                `android=new UiSelector().resourceId("com.instagram.android:id/row_profile_header_textview_followers_title")`
            )
            .click();

        // Wait for followers list
        const followersList = await driver.$(
            `android=new UiSelector().resourceId("android:id/list")`
        );
        await followersList.waitForDisplayed();

        // Scroll and collect followers data
        for (let i = 0; i < baseProfile.followerCount; i++) {
            try {
                const followerContainer = await driver.$(
                    `android=new UiSelector().resourceId("com.instagram.android:id/follow_list_container").instance(${i})`
                );
                await followerContainer.waitForExist({ timeout: 5000 });

                // Scroll if needed
                if (i % 5 === 4 && i < baseProfile.followerCount - 1) {
                    await driver.touchAction([
                        { action: "press", x: 500, y: 1700 },
                        { action: "moveTo", x: 500, y: 300 },
                        "release",
                    ]);
                    await driver.pause(1000);
                }
            } catch (error) {
                console.error(`Error processing follower ${i}:`, error);
            }
        }

        await driver.back();

        // Get following count
        const followingElement = await driver.$(
            `android=new UiSelector().resourceId("com.instagram.android:id/row_profile_header_textview_following_count")`
        );
        baseProfile.followingCount = parseInt(await followingElement.getText());

        // Click following to open the list
        await driver
            .$(
                `android=new UiSelector().resourceId("com.instagram.android:id/row_profile_header_textview_following_title")`
            )
            .click();

        // Wait for following list
        const followingList = await driver.$(
            `android=new UiSelector().resourceId("android:id/list")`
        );
        await followingList.waitForDisplayed();

        // Scroll and collect following data
        for (let i = 0; i < baseProfile.followingCount; i++) {
            try {
                const followingContainer = await driver.$(
                    `android=new UiSelector().resourceId("com.instagram.android:id/follow_list_container").instance(${i})`
                );
                await followingContainer.waitForExist({ timeout: 5000 });

                // Scroll if needed
                if (i % 5 === 4 && i < baseProfile.followingCount - 1) {
                    await driver.touchAction([
                        { action: "press", x: 500, y: 1700 },
                        { action: "moveTo", x: 500, y: 300 },
                        "release",
                    ]);
                    await driver.pause(1000);
                }
            } catch (error) {
                console.error(`Error processing following ${i}:`, error);
            }
        }

        await driver.back();

        // Upload to MongoDB and return data
        await insertInstagramProfile(username, baseProfile);
        return baseProfile;
    } catch (error) {
        console.error("Error during scraping:", error);
    }
}
