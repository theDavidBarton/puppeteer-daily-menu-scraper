/*
 * copyright 2019, David Barton (theDavidBarton)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const puppeteer = require('puppeteer')
const objectDecider = require('./../lib/objectDecider')
const priceCatcher = require('./../lib/priceCatcher')
const stringValueCleaner = require('./../lib/stringValueCleaner')
const browserWSEndpoint = require('./../src/dailyMenuScraper').browserWSEndpoint
const finalJSON = require('./../src/dailyMenuScraper').finalJSON
const finalMongoJSON = require('./../src/dailyMenuScraper').finalMongoJSON
const RestaurantMenuOutput = require('./../src/restaurantMenuClasses').RestaurantMenuOutput
const RestaurantMenuDb = require('./../src/restaurantMenuClasses').RestaurantMenuDb

async function scraper() {
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

  /*
   * @ ROZA
   * ------------------------------------------
   * contact info:
   * Address: Budapest, Jókai u. 22, 1066
   * Phone: (30) 611 4396
   * -----------------------------------------
   */

  // @ ROZA parameters
  let paramColor = '#fced4e'
  let paramTitleString = 'Róza Soup Restaurant'
  let paramUrl = 'https://www.facebook.com/pg/rozafinomitt/posts/'
  let paramIcon =
    'https://scontent.fbud5-1.fna.fbcdn.net/v/t1.0-1/10394619_390942531075147_2725477335166513345_n.jpg?_nc_cat=108&_nc_oc=AQmYePlHDUuQq8mobFYahU1UY5c-BqLoTnXZcMZ6PhYThgnyFqkGNqZWmsHOwzUEwZM&_nc_ht=scontent.fbud5-1.fna&oh=05bb8d72ba040dc6dbe894a50587fcc3&oe=5E3DA8B6'
  let paramAddressString = 'Budapest, Jókai u. 22, 1066'
  let paramValueString
  let paramPriceString
  let paramPriceCurrency
  let paramPriceCurrencyString
  let dailyRoza
  let obj = null
  let mongoObj = null

  // @ ROZA selector
  const dailyRozaSelector = '.userContent'

  try {
    await page.goto(paramUrl, { waitUntil: 'domcontentloaded' })
    // @ ROZA Daily
    dailyRoza = await page.evaluate(el => el.textContent, (await page.$$(dailyRozaSelector))[0])
    // @ ROZA price catch
    let { price, priceCurrencyStr, priceCurrency } = await priceCatcher.priceCatcher(dailyRoza)
    paramPriceString = price
    paramPriceCurrency = priceCurrency
    paramPriceCurrencyString = priceCurrencyStr

    paramValueString = '• Daily menu: ' + (await stringValueCleaner.stringValueCleaner(dailyRoza, true)) // @ ROZA clean string
    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString)
    console.log(paramPriceString + paramPriceCurrencyString + '\n')
    // @ ROZA object
    obj = new RestaurantMenuOutput(
      paramColor,
      paramTitleString,
      paramUrl,
      paramIcon,
      paramValueString,
      paramPriceString,
      paramPriceCurrency,
      paramPriceCurrencyString,
      paramAddressString
    )
    mongoObj = new RestaurantMenuDb(paramTitleString, paramPriceString, paramPriceCurrency, paramValueString)
    if (objectDecider.objectDecider(paramValueString)) {
      finalJSON.attachments.push(obj)
      finalMongoJSON.push(mongoObj)
    }
  } catch (e) {
    console.error(e)
  }
  await page.goto('about:blank')
  await page.close()
  await browser.disconnect()
}
module.exports.scraper = scraper
