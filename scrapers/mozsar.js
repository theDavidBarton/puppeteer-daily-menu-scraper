/*
 * ___________
 * MIT License
 *
 * Copyright (c) 2020 David Barton
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const puppeteer = require('puppeteer')
const moment = require('moment')
const dateCatcher = require('./../lib/dateCatcher')
const objectDecider = require('./../lib/objectDecider')
const priceCatcher = require('./../lib/priceCatcher')
const priceCompareToDb = require('./../lib/priceCompareToDb')
const stringValueCleaner = require('./../lib/stringValueCleaner')
const browserWSEndpoint = require('./../src/dailyMenuScraper').browserWSEndpoint
const today = require('./../src/date').date.today
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
    /hétfő(.*\r?\n){2}/gi,
    /kedd(.*\r?\n){2}/gi,
    /szerda(.*\r?\n){2}/gi,
    /csütörtök(.*\r?\n){2}/gi,
    /péntek(.*\r?\n){2}/gi
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
      paramValueString = paramValueString.toString().replace(/ Ital(\r?\n)/g, '') // ugly, but cleaner value for Fridays from necessary regex
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
