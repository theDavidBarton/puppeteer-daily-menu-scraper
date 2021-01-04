const puppeteer = require('puppeteer')
const { RestaurantMenuOutput } = require('./../src/restaurantMenuClasses')
const { RestaurantMenuDb } = require('./../src/restaurantMenuClasses')
const { browserWSEndpoint } = require('./../src/index')
const { finalJSON } = require('./../src/index')
const { finalMongoJSON } = require('./../src/index')

const scraper = async () => {
  const browser = await puppeteer.connect({ browserWSEndpoint })
  const page = await browser.newPage()

  // abort all images, source: https://github.com/GoogleChrome/puppeteer/blob/master/examples/block-images.js
  await page.setRequestInterception(true)
  page.on('request', request => {
    if (request.resourceType() === 'image') {
      request.abort()
    } else {
      request.continue()
    }
  })
}
module.exports.scraper = scraper
