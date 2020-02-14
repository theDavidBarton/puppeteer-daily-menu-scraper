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
   * @ KORHELY
   * ---------------------------------------------
   * contact info:
   * Address: Budapest, Liszt Ferenc tér 7, 1061
   * Phone: (1) 321 0280
   * ---------------------------------------------
   */

  // @ KORHELY parameters
  let paramColor = '#c6b443'
  let paramTitleString = 'Korhely'
  let paramUrl = 'http://www.korhelyfaloda.hu/menu'
  let paramIcon = 'https://etterem.hu/img/max960/p9787n/1393339359-3252.jpg'
  let paramValueString
  let paramPriceString
  let paramPriceCurrency
  let paramPriceCurrencyString
  let paramAddressString = 'Budapest, Liszt Ferenc tér 7, 1061'
  let weeklySoupKorhely
  let weeklyMainKorhely
  let weeklyDessertKorhely
  let found
  let obj = null
  let mongoObj = null

  // @ KORHELY selectors
  const summarySelector = '.MenusNavigation_description'
  const weeklySoupKorhelySelector = '#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(1)'
  const weeklyMainKorhelySelector = '#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(2)'
  const weeklyDessertKorhelySelector = '#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(3)'

  try {
    await page.goto(paramUrl, { waitUntil: 'networkidle2', timeout: 0 })
    let linkSelectorKorhely = '#TPASection_ije2yufiiframe'
    const linkKorhely = await page.evaluate(el => el.src, await page.$(linkSelectorKorhely))
    await page.goto(linkKorhely, { waitUntil: 'networkidle2', timeout: 0 })
  } catch (e) {
    console.error(e)
  }
  // @ KORHELY Weekly
  try {
    const summary = await page.evaluate(el => el.textContent, (await page.$$(summarySelector))[1])
    // @ KORHELY price catch
    let { price, priceCurrencyStr, priceCurrency } = await priceCatcher.priceCatcher(summary)
    let trend = await priceCompareToDb.priceCompareToDb(paramTitleString, price)
    paramPriceString = price
    paramPriceCurrency = priceCurrency
    paramPriceCurrencyString = priceCurrencyStr + trend

    found = await dateCatcher.dateCatcher(summary, true)
    if (found === true) {
      weeklySoupKorhely = await page.evaluate(el => el.innerText, await page.$(weeklySoupKorhelySelector))
      weeklyMainKorhely = await page.evaluate(el => el.innerText, await page.$(weeklyMainKorhelySelector))
      weeklyDessertKorhely = await page.evaluate(el => el.innerText, await page.$(weeklyDessertKorhelySelector))

      paramValueString =
        '• Soups: ' +
        (await stringValueCleaner.stringValueCleaner(weeklySoupKorhely, false)) +
        '\n' +
        '• Main courses: ' +
        (await stringValueCleaner.stringValueCleaner(weeklyMainKorhely, false)) +
        '\n' +
        '• Desserts: ' +
        (await stringValueCleaner.stringValueCleaner(weeklyDessertKorhely, false))
    } else {
      paramValueString = 'menu is outdated!'
    }

    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString)
    console.log(paramPriceString + paramPriceCurrencyString + '\n')
    // @ KORHELY object
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
