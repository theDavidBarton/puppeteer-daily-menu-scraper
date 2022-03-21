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
const dateCatcher = require('./../lib/dateCatcher')
const objectDecider = require('./../lib/objectDecider')
const priceCatcher = require('./../lib/priceCatcher')
const priceCompareToDb = require('./../lib/priceCompareToDb')
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
  let weeklyI55
  let weeklyI55Daily
  let found
  let trend
  let obj = null
  let mongoObj = null

  // @ I55 selectors
  const weeklyI55Selector = '#szoszok'
  const weeklyI55SelectorFallback = '.userContent'

  try {
    await page.goto(paramUrl, { waituntil: 'domcontentloaded', timeout: 0 })
    weeklyI55 = await page.evaluate(el => el.textContent, (await page.$$(weeklyI55Selector))[0])
    weeklyI55Daily = weeklyI55.match(/levesek([\s\S]*?)ebédelj/gi)
    // @ I55 price catch
    let { price, priceCurrencyStr, priceCurrency } = priceCatcher.priceCatcher(weeklyI55)
    trend = await priceCompareToDb.priceCompareToDb(paramTitleString, price)
    paramPriceString = price
    paramPriceCurrency = priceCurrency
    paramPriceCurrencyString = priceCurrencyStr + trend

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
          // @ I55 price catch
          let { price, priceCurrencyStr, priceCurrency } = await priceCatcher.priceCatcher(weeklyI55, 1)
          trend = await priceCompareToDb.priceCompareToDb(paramTitleString, price)
          paramPriceString = price
          paramPriceCurrency = priceCurrency
          paramPriceCurrencyString = priceCurrencyStr + trend
          found = await dateCatcher.dateCatcher(weeklyI55, true) // @ I55 catch date
          if (found === true) {
            paramValueString = await stringValueCleaner.stringValueCleaner(weeklyI55Daily, false)
            paramValueString = paramValueString.replace(/\(\)/g, '').replace(/\n/, ' ') // to be moved to stringValueCleaner module later!
            break forlabel
          } else {
            paramValueString = 'menu is outdated!'
          }
        }
      }
    }
    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString)
    console.log(paramPriceString + paramPriceCurrencyString + '\n')

    // @ I55 object
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
