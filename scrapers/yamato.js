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
const browserWSEndpoint = require('./../src/index').browserWSEndpoint
const today = require('./../src/date').date.today
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
   * @ YAMATO
   * ---------------------------------------
   * contact info:
   * Address: Budapest, 1066, JÓKAI U. 30.
   * Phone: +36(70)681-75-44
   * ---------------------------------------
   * description:
   * yamatoArray: contains selectors for tha days of the week
   * yamato: is the text inside selector (actual menu), and also the final cleaned text to be displayed in output
   */

  // @ YAMATO parameters
  let paramColor = '#cca92b'
  let paramTitleString = 'Yamato'
  let paramUrl = 'https://www.wasabi.hu/napimenu.php?source=yamato&lang=hu'
  let paramIcon = 'http://yamatorestaurant.hu/wp-content/uploads/2014/12/yamato_logo_retina.png'
  let paramValueString
  let paramPriceString
  let paramPriceCurrency
  let paramPriceCurrencyString
  let paramAddressString = 'Budapest, 1066, Jókai u. 30.'
  let yamato
  let found
  let obj = null
  let mongoObj = null

  // @ YAMATO selectors
  let yamatoSelector = '.fr-tag'
  let yamatoArray = [0, 1, 3, 5, 7, 9]

  try {
    await page.goto(paramUrl, { waitUntil: 'domcontentloaded', timeout: 0 })
    const theWhole = await page.evaluate(el => el.textContent, await page.$('body'))
    found = await dateCatcher.dateCatcher(theWhole) // @ YAMATO catch date
    // @ YAMATO price catch
    let { price, priceCurrencyStr, priceCurrency } = await priceCatcher.priceCatcher(theWhole)
    let trend = await priceCompareToDb.priceCompareToDb(paramTitleString, price)

    paramPriceString = price
    paramPriceCurrency = priceCurrency
    paramPriceCurrencyString = priceCurrencyStr + trend
    // @ YAMATO Monday-Friday
    for (let i = today; i < today + 1; i++) {
      if (found === true) {
        yamato = await page.evaluate(el => el.textContent, (await page.$$(yamatoSelector))[yamatoArray[i]])
        yamato = yamato.replace(/(\r?\n)/gm, ', ')
      } else {
        yamato = '♪"No Milk Today"♫'
      }
      paramValueString = '• Daily menu: ' + yamato
      console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
      console.log(paramValueString)
      console.log(paramPriceString + paramPriceCurrencyString + '\n')
      // @ YAMATO object
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
    }
  } catch (e) {
    console.error(e)
  }
  await page.goto('about:blank')
  await page.close()
  await browser.disconnect()
}
module.exports.scraper = scraper
