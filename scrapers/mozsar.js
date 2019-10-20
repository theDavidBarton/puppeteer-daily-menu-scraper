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
const today = require('./../scrapeDailyMenu').today
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
   * @ MOZSAR
   * ------------------------------------------
   * contact info:
   * Address: Budapest, Nagymező u. 21, 1065
   * Phone: +36 (70) 426 8199
   * -----------------------------------------
   */

  // @ MOZSAR parameters
  let paramColor = '#bc4545'
  let paramTitleString = 'Mozsár Bisztro'
  let paramUrl = 'http://mozsarbisztro.hu/index.php?p=3'
  let paramIcon =
    'https://www.programturizmus.hu/media/image/big/ajanlat/program/tudomanyos-programok/tanfolyam/76/19396-mozsar-kavezo-program.jpg'
  let paramValueString
  let paramPriceString
  let paramPriceCurrency
  let paramPriceCurrencyString
  let paramAddressString = 'Budapest, Nagymező u. 21, 1065'
  let mozsar
  let mozsarDate
  let mozsarSummary
  let found
  let trend
  let obj = null
  let mongoObj = null

  // @ MOZSAR selectors
  const mozsarSelector = '#etlapresult'
  const mozsarDateSelector = '.flipInY'
  const mozsarPriceSelector = '.item'
  const mozsarDaysRegexArray = [
    null,
    /hétfő([\s\S]*?)kedd/gi,
    /kedd([\s\S]*?)szerda/gi,
    /szerda([\s\S]*?)csütörtök/gi,
    /csütörtök([\s\S]*?)péntek/gi,
    /péntek([\s\S]*?)ital/gi
  ]

  try {
    await page.goto(paramUrl, { waitUntil: 'networkidle2' })
    mozsar = await page.evaluate(el => el.textContent, (await page.$$(mozsarSelector))[0])
    mozsarDate = await page.evaluate(el => el.textContent, (await page.$$(mozsarDateSelector))[0])
    mozsarSummary = await page.evaluate(el => el.textContent, (await page.$$(mozsarPriceSelector))[0])

    // @ MOZSAR price catch
    let { price, priceCurrencyStr, priceCurrency } = await priceCatcher.priceCatcher(mozsarSummary)
    trend = await priceCompareToDb.priceCompareToDb(paramTitleString, price)
    paramPriceString = price
    paramPriceCurrency = priceCurrency
    paramPriceCurrencyString = priceCurrencyStr + trend

    // @ MOZSAR date catch
    mozsarDate = mozsarDate.replace(/Heti menü |- /gi, moment().year() + '.').replace(/\. /gi, '. - ')
    found = await dateCatcher.dateCatcher(mozsarDate, true)

    // @ MOZSAR menu parse
    if (found === true) {
      paramValueString = mozsar.match(mozsarDaysRegexArray[today])
      paramValueString = paramValueString.toString().replace(/ ital$/gi, '') // ugly, but cleaner value for Fridays from necessary regex
      paramValueString = '• Daily menu: ' + (await stringValueCleaner.stringValueCleaner(paramValueString, false))
    } else {
      paramValueString = '• Daily menu: ♪"No Milk Today"♫'
    }

    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString)
    console.log(paramPriceString + paramPriceCurrencyString + '\n')

    // @ MOZSAR object
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
