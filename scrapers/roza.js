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
const stringValueCleaner = require('./../lib/stringValueCleaner')
const browserWSEndpoint = require('./../src/index').browserWSEndpoint
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
    'https://scontent.fbud5-1.fna.fbcdn.net/v/t1.0-1/10394619_390942531075147_2725477335166513345_n.jpg?_nc_cat=108&_nc_oc=AQmYePlHDUuQq8mobFYahU1UY5c-BqLoTnXZcMZ6PhYThgnyFqkGNqZWmsHOwzUEwZM&_nc_ht=scontent.fbud5-1.fna&oh=05bb8d72ba040dc6dbe894a50587fcc3&oe=5E3DA8B6'
  let paramAddressString = 'Budapest, Jókai u. 22, 1066'
  let paramValueString
  let paramPriceString
  let paramPriceCurrency
  let paramPriceCurrencyString
  let dailyRoza
  let obj = null
  let mongoObj = null

  // @ ROZA selector
  const dailyRozaSelector = '.userContent'

  try {
    await page.goto(paramUrl, { waitUntil: 'domcontentloaded' })
    // @ ROZA Daily
    dailyRoza = await page.evaluate(el => el.textContent, (await page.$$(dailyRozaSelector))[0])
    // @ ROZA price catch
    let { price, priceCurrencyStr, priceCurrency } = await priceCatcher.priceCatcher(dailyRoza)
    paramPriceString = price
    paramPriceCurrency = priceCurrency
    paramPriceCurrencyString = priceCurrencyStr

    paramValueString = '• Daily menu: ' + (await stringValueCleaner.stringValueCleaner(dailyRoza, true)) // @ ROZA clean string
    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString)
    console.log(paramPriceString + paramPriceCurrencyString + '\n')
    // @ ROZA object
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
