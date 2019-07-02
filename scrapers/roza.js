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
const priceCatcher = require('./../lib/priceCatcher')
const stringValueCleaner = require('./../lib/stringValueCleaner')
const browserWSEndpoint = require('./../scrapeDailyMenu').browserWSEndpoint
const finalJSON = require('./../scrapeDailyMenu').finalJSON
const finalMongoJSON = require('./../scrapeDailyMenu').finalMongoJSON
const RestaurantMenuOutput = require('./../scrapeDailyMenu').RestaurantMenuOutput
const RestaurantMenuDb = require('./../scrapeDailyMenu').RestaurantMenuDb

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
    'https://scontent.fbud1-1.fna.fbcdn.net/v/t1.0-1/10394619_390942531075147_2725477335166513345_n.jpg?_nc_cat=108&_nc_ht=scontent.fbud1-1.fna&oh=e1e55fe2b089e8334deaef4895579833&oe=5D77E7B6'
  let paramAddressString = 'Budapest, Jókai u. 22, 1066'
  let paramValueString
  let paramPriceString
  let dailyRoza

  // @ ROZA selector
  const dailyRozaSelector = '.userContent'

  try {
    await page.goto(paramUrl, { waitUntil: 'domcontentloaded' })
    // @ ROZA Daily
    dailyRoza = await page.evaluate(el => el.textContent, (await page.$$(dailyRozaSelector))[0])
    paramPriceString = await priceCatcher.priceCatcher(dailyRoza) // @ ROZA price catch
    paramValueString = '• Daily menu: ' + (await stringValueCleaner.stringValueCleaner(dailyRoza, true)) // @ ROZA clean string
    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString + '\n')
    // @ ROZA object
    let rozaObj = new RestaurantMenuOutput(
      paramColor,
      paramTitleString,
      paramUrl,
      paramIcon,
      paramValueString,
      paramPriceString,
      paramAddressString
    )
    let rozaMongoObj = new RestaurantMenuDb(paramTitleString, paramPriceString, paramValueString)
    finalJSON.attachments.push(rozaObj)
    finalMongoJSON.push(rozaMongoObj)
  } catch (e) {
    console.error(e)
  }
  await page.goto('about:blank')
  await page.close()
  await browser.disconnect()
}
module.exports.scraper = scraper
