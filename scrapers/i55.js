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

async function scraper(){
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
   * @ I55 American Restaurant
   * ------------------------------------------
   * contact info:
   * Address: Budapest, Alkotmány u. 20, 1054
   * Phone: (1) 400 9580
   * -----------------------------------------
   */

  // @ I55 parameters
  let paramColor = '#104283'
  let paramTitleString = 'I55'
  let paramUrl = 'http://i55.hu/ebedmenu/'
  let paramIcon = 'http://i55.hu/wp-content/uploads/2018/05/i55-1.png'
  let paramValueString
  let paramPriceString
  let paramAddressString = 'Budapest, Alkotmány u. 20, 1054'
  let weeklyI55

  // @ I55 selectors
  const weeklyI55Selector = '.vc_column-inner'

  try {
    await page.goto(paramUrl, { waituntil: 'domcontentloaded', timeout: 0 })
    weeklyI55 = await page.evaluate(el => el.textContent, (await page.$$(weeklyI55Selector))[1])
    paramPriceString = await priceCatcher.priceCatcher(weeklyI55) // @ I55 price catch

    paramValueString = await stringValueCleaner.stringValueCleaner(weeklyI55, false)

    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString + '\n')

    // @ I55 object
    let i55Obj = new RestaurantMenuOutput(
      paramColor,
      paramTitleString,
      paramUrl,
      paramIcon,
      paramValueString,
      paramPriceString,
      paramAddressString
    )
    let i55MongoObj = new RestaurantMenuDb(paramTitleString, paramPriceString, paramValueString)
    finalJSON.attachments.push(i55Obj)
    finalMongoJSON.push(i55MongoObj)
  } catch (e) {
    console.error(e)
  }
  await page.goto('about:blank')
  await page.close()
  await browser.disconnect()
}
module.exports.scraper = scraper
