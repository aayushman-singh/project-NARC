import { createPlaywrightRouter, log, Dataset } from 'crawlee';

export const router = createPlaywrightRouter();

// First handler for extracting post links on the hashtag page
router.addDefaultHandler(async ({ page, request, enqueueLinks }) => {
    log.debug(`Visiting page: ${request.url}`);

    // Wait for posts to load
    await page.waitForSelector('a.x1i10hfl.xjbqb8w.x1ejq31n');

    // Extract post links and enqueue them
    const postLinks = await page.$$eval('a.x1i10hfl.xjbqb8w.x1ejq31n', elements =>
        (elements as HTMLAnchorElement[]).map(el => el.href)
    );

    log.debug(`Found ${postLinks.length} post links. Enqueuing...`);

    for (const postLink of postLinks) {
        await enqueueLinks({
            urls: [postLink],
            label: 'postPage', // Label the individual post pages
        });
    }
});

// Handler for extracting image data and comments from individual posts
router.addHandler('postPage', async ({ page }) => {
    log.debug('Extracting image and comments from post page.');

    // Wait for the image and comments to load
    await page.waitForSelector('div._aagu div._aagv img');

    // Extract image data
    const imageUrl = await page.$eval('div._aagu div._aagv img', (img) => {
      if (img instanceof HTMLImageElement) {
          return img.src;
      }
      return null;
  });
  
  const altText = await page.$eval('div._aagu div._aagv img', (img) => {
      if (img instanceof HTMLImageElement) {
          return img.alt;
      }
      return '';
  });

    // Extract comments
    const comments = await page.$$eval('ul._a9ym li span', commentElements =>
        commentElements.map(comment => comment.textContent)
    );
    await Dataset.pushData(JSON.stringify({
      imageUrl,
      altText,
      comments
  }));
    log.info(JSON.stringify({
      imageUrl,
      altText,
      comments
  }));
  
});
