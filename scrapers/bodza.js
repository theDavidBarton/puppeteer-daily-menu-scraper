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
const priceCatcher = require('./../lib/priceCatcher')
const objectDecider = require('./../lib/objectDecider')
const priceCompareToDb = require('./../lib/priceCompareToDb')
const browserWSEndpoint = require('./../src/index').browserWSEndpoint
const todayDotSeparated = require('./../src/date').date.todayDotSeparated
const finalJSON = require('./../src/index').finalJSON
const finalMongoJSON = require('./../src/index').finalMongoJSON
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
   * @ BODZA BISTRO
   * ------------------------------------------
   * contact info:
   * Address: Budapest, Bajcsy-Zsilinszky út 12, 1051
   * Phone: 06 (30) 515-52-34
   * -----------------------------------------
   */

  // @ BODZA parameters
  let paramColor = '#c7ef81'
  let paramTitleString = 'Bodza bistro'
  let paramUrl = 'http://bodzabistro.hu/heti-menu/'
  let paramIcon = 'http://bodzabistro.hu/wp-content/uploads/2016/03/nevtelen-1.png'
  let paramSelector = '.container'
  let paramValueString
  let paramPriceString
  let paramPriceCurrency
  let paramPriceCurrencyString
  let paramAddressString = 'Budapest, Bajcsy-Zsilinszky út 12, 1051'
  let bodzaDaily
  let obj = null
  let mongoObj = null

  try {
    await page.goto(paramUrl, { waitUntil: 'domcontentloaded', timeout: 0 })
    // @ BODZA selectors
    let bodzaBlock = await page.$$(paramSelector)
    // @ BODZA Monday-Friday
    forlabelBodza: for (let i = 0; i < bodzaBlock.length; i++) {
      bodzaDaily = await page.evaluate(el => el.textContent, (await page.$$(paramSelector))[i])
      if (bodzaDaily.match(todayDotSeparated)) {
        // @ BODZA price catch
        let { price, priceCurrencyStr, priceCurrency } = await priceCatcher.priceCatcher(bodzaDaily)
        let trend = await priceCompareToDb.priceCompareToDb(paramTitleString, price)
        paramPriceString = price
        paramPriceCurrency = priceCurrency
        paramPriceCurrencyString = priceCurrencyStr + trend

        bodzaDaily = bodzaDaily.match(/(.*)CHEF NAPI AJÁNLATA(.*\r?\n){3}/gi)
        bodzaDaily = bodzaDaily
          .join()
          .replace(/(\r?\n)/gm, ' ')
          .replace(/\s\s+/gm, ' ')
          .replace(/(.*)CHEF NAPI AJÁNLATA/g, '')

        break forlabelBodza
      }
      bodzaDaily = '♪"No Milk Today"♫'
      // sorry about this one :(
      paramPriceString = 'n/a'
      paramPriceCurrency = 'n/a'
      paramPriceCurrencyString = ''
    }
    paramValueString = '• Daily menu: ' + bodzaDaily
    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString)
    console.log(paramPriceString + paramPriceCurrencyString + '\n')
    // @ BODZA object
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
