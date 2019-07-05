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
const dateCatcher = require('./../lib/dateCatcher')
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
  let paramUrlFallback = 'https://www.facebook.com/pg/i55americanrestaurant/posts/'
  let paramIcon = 'http://i55.hu/wp-content/uploads/2018/05/i55-1.png'
  let paramValueString
  let paramPriceString
  let paramPriceCurrency
  let paramPriceCurrencyString
  let paramAddressString = 'Budapest, Alkotmány u. 20, 1054'
  let weeklyI55, weeklyI55Daily
  let found

  // @ I55 selectors
  const weeklyI55Selector = '.vc_column-inner'
  const weeklyI55SelectorFallback = '.userContent'

  try {
    await page.goto(paramUrl, { waituntil: 'domcontentloaded', timeout: 0 })
    weeklyI55 = await page.evaluate(el => el.textContent, (await page.$$(weeklyI55Selector))[1])
    weeklyI55Daily = weeklyI55.match(/levesek([\s\S]*?)ebédelj/gi)
    // @ I55 price catch
    let { price, priceCurrencyStr, priceCurrency } = await priceCatcher.priceCatcher(weeklyI55, 1)
    paramPriceString = price
    paramPriceCurrency = priceCurrency
    paramPriceCurrencyString = priceCurrencyStr

    found = await dateCatcher.dateCatcher(weeklyI55, true) // @ I55 catch date
    if (found === true) {
      paramValueString = await stringValueCleaner.stringValueCleaner(weeklyI55Daily, false)
      paramValueString = paramValueString.replace(/\(\)/g, '').replace(/\n/, ' ') // to be moved to stringValueCleaner module later!

      // fallback on facebook page
    } else {
      await page.goto(paramUrlFallback, { waituntil: 'domcontentloaded', timeout: 0 })
      forlabel: for (let i = 0; i < 10; i++) {
        weeklyI55 = await page.evaluate(el => el.textContent, (await page.$$(weeklyI55SelectorFallback))[i])
        if (weeklyI55.match(/levesek([\s\S]*?)ebédelj/gi)) {
          weeklyI55Daily = weeklyI55.match(/levesek([\s\S]*?)ebédelj/gi)
          paramPriceString = await priceCatcher.priceCatcher(weeklyI55, 1) // @ I55 price catch
          found = await dateCatcher.dateCatcher(weeklyI55, true) // @ I55 catch date
          if (found === true) {
            paramValueString = await stringValueCleaner.stringValueCleaner(weeklyI55Daily, false)
            paramValueString = paramValueString.replace(/\(\)/g, '').replace(/\n/, ' ') // to be moved to stringValueCleaner module later!
            break forlabel
          } else {
            paramValueString = 'menu is out of date!'
          }
        }
      }
    }
    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString)
    console.log(paramPriceString + paramPriceCurrencyString + '\n')

    // @ I55 object
    let obj = new RestaurantMenuOutput(
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
    let mongoObj = new RestaurantMenuDb(
      paramTitleString,
      paramPriceString,
      paramPriceCurrency,
      paramValueString
    )
    finalJSON.attachments.push(obj)
    finalMongoJSON.push(mongoObj)
  } catch (e) {
    console.error(e)
  }
  await page.goto('about:blank')
  await page.close()
  await browser.disconnect()
}
module.exports.scraper = scraper
