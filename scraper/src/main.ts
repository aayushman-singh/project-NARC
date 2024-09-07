import { Actor } from 'apify'
import { PlaywrightCrawler, log } from 'crawlee'
import { router } from './route.js'

await Actor.init()

// This is better set with CRAWLEE_LOG_LEVEL env var
// or a configuration option. This is just for show 😈
log.setLevel(log.LEVELS.DEBUG)

log.debug('Setting up crawler.')
const crawler = new PlaywrightCrawler({

  maxRequestsPerCrawl: 50,

  requestHandler: router
})

await crawler.run(['https://www.instagram.com/explore/tags/japan'])

await Actor.exit()
