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
const moment = require('moment')
const dateCatcher = require('./../lib/dateCatcher')
const objectDecider = require('./../lib/objectDecider')
const priceCatcher = require('./../lib/priceCatcher')
const priceCompareToDb = require('./../lib/priceCompareToDb')
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
   * @ BANK 3
   * ------------------------------------------
   * contact info:
   * Address: Budapest, Bank u. 3, 1054
   * Phone: +36 (1) 788 2775
   * -----------------------------------------
   */

  // @ BANK 3 parameters
  let paramColor = '#000000'
  let paramTitleString = 'Bank 3'
  let paramUrl = 'http://www.bank3.hu/'
  let paramIcon = 'http://m.bank3.hu/ogs/sh-b6fc80e2-df8b-c2e5-1000-e056251f1792_logo_200x200.png?ver=1474612940'
  let paramValueString
  let paramPriceString
  let paramPriceCurrency
  let paramPriceCurrencyString
  let paramAddressString = 'Budapest, Bank u. 3, 1054'
  let bank3
  let bank3Date
  let bank3Summary
  let found
  let trend
  let obj = null
  let mongoObj = null

  // @ BANK 3 selectors
  const bank3Selector = '#etlapresult'
  const bank3DateSelector = '.flipInY' // $$('.text-right')[0].textContent

  try {
    await page.goto(paramUrl, { waitUntil: 'networkidle2' })
    bank3 = await page.evaluate(el => el.textContent, (await page.$$(bank3Selector))[0])
    bank3Date = await page.evaluate(el => el.textContent, (await page.$$(bank3DateSelector))[0])
    bank3Summary = await page.evaluate(el => el.textContent, (await page.$$(bank3PriceSelector))[0])

    // @ BANK 3 price catch
    let { price, priceCurrencyStr, priceCurrency } = await priceCatcher.priceCatcher(bank3Summary)
    trend = await priceCompareToDb.priceCompareToDb(paramTitleString, price)
    paramPriceString = price
    paramPriceCurrency = priceCurrency
    paramPriceCurrencyString = priceCurrencyStr + trend

    // @ BANK 3 date catch
    bank3Date = bank3Date.replace(/Heti menü |- /gi, moment().year() + '.').replace(/\. /gi, '. - ')
    found = await dateCatcher.dateCatcher(bank3Date, true)

    // @ BANK 3 menu parse
    if (found === true) {
      paramValueString = bank3.match(bank3DaysRegexArray[today])
      paramValueString = paramValueString.toString().replace(/ Ital(\r?\n)/g, '') // ugly, but cleaner value for Fridays from necessary regex
      paramValueString = '• Daily menu: ' + (await stringValueCleaner.stringValueCleaner(paramValueString, false))
    } else {
      paramValueString = '• Daily menu: ♪"No Milk Today"♫'
    }

    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString)
    console.log(paramPriceString + paramPriceCurrencyString + '\n')

    // @ BANK 3 object
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
