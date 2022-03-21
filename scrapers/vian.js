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
const objectDecider = require('./../lib/objectDecider')
const priceCatcher = require('./../lib/priceCatcher')
const priceCompareToDb = require('./../lib/priceCompareToDb')
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
   * @ VIAN
   * ------------------------------------------
   * contact info:
   * Address: Budapest, Liszt Ferenc tér 9, 1061
   * Phone: (1) 268 1154
   * -----------------------------------------
   * description:
   * vianArray[1-2]: contains selectors for tha days of the week
   * vian[1-2]: is the text inside selector (actual menu) to be displayed in output
   */

  // @ VIAN parameters
  let paramColor = '#cc2b2b'
  let paramTitleString = 'Cafe Vian'
  let paramUrl = 'http://www.cafevian.com/ebedmenue'
  let paramIcon = 'https://static.wixstatic.com/media/d21995_af5b6ceedafd4913b3ed17f6377cdfa7~mv2.png'
  let paramValueString
  let paramPriceString
  let paramPriceCurrency
  let paramPriceCurrencyString
  let paramAddressString = 'Budapest, Liszt Ferenc tér 9, 1061'
  let vian
  let obj = null
  let mongoObj = null

  // @ VIAN selectors [1: first course, 2: main course]
  let vianSelector = 'div.heartyQ2riU'

  try {
    await page.goto(paramUrl, { waitUntil: 'domcontentloaded', timeout: 0 })
    let linkSelectorVian = '#TPASection_jkic76na > iframe'
    const linkVian = await page.evaluate(el => el.src, (await page.$$(linkSelectorVian))[0])
    await page.goto(linkVian, { waitUntil: 'domcontentloaded', timeout: 0 })
  } catch (e) {
    console.error(e)
  }
  // @ VIAN Monday-Friday
  try {
    if ((await page.$(vianArray1[i])) !== null) {
      vian = await page.evaluate(el => el.innerText, (await page.$(vianSelector))[today - 1])
    } else {
      vian = '♪"No Milk Today"♫'
    }
    const body = await page.evaluate(el => el.textContent, (await page.$$('#mainDiv'))[0])
    // @ VIAN price catch
    let { price, priceCurrencyStr, priceCurrency } = priceCatcher.priceCatcher(body)
    let trend = await priceCompareToDb.priceCompareToDb(paramTitleString, price)

    paramPriceString = price
    paramPriceCurrency = priceCurrency
    paramPriceCurrencyString = priceCurrencyStr + trend

    paramValueString = '• Daily menu: ' + vian
    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString)
    console.log(paramPriceString + paramPriceCurrencyString + '\n')
    // @ VIAN object
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
