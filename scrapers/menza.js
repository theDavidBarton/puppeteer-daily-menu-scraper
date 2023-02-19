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
const dateCatcher = require('./../lib/dateCatcher')
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
   * @ MENZA
   * ------------------------------------------
   * contact info:
   * Address: 1061 Budapest, Liszt Ferenc tér 2.
   * Phone: +36 30 145 4242
   * -----------------------------------------
   */

  // @ KAMRA parameters
  let paramColor = '#be8e8e'
  let paramTitleString = 'Menza'
  let paramUrl = 'https://menzaetterem.hu/etlap/'
  let paramIcon = 'https://menzaetterem.hu/site/themes/menza/typerocket/wordpress/assets/images/favicon-32x32.png'
  let paramValueString
  let paramPriceString
  let paramPriceCurrency
  let paramPriceCurrencyString
  let paramAddressString = '1061 Budapest, Liszt Ferenc tér 2.'
  let dailyMenza = []
  let obj = null
  let mongoObj = null

  // @ MENZA RegEx expressions
  const menzaArray = [
    null,
    /hétfő((.*)\r?\n+){7}/gim,
    /kedd((.*)\r?\n+){7}/gim,
    /szerda((.*)\r?\n+){7}/gim,
    /csütörtök((.*)\r?\n+){7}/gim,
    /péntek((.*)\r?\n+){7}/gim
  ]

  try {
    await page.goto(paramUrl, { waitUntil: 'networkidle2' })
    const body = await page.evaluate(el => el.innerText, (await page.$$('body'))[0])
    // @ MENZA Monday-Friday
    body.match(menzaArray[today]) ? (dailyMenza = body.match(menzaArray[today])[0]) : (dailyMenza = '♪"No Milk Today"♫')

    // @ MENZA price catch
    console.log('\n')
    const { price, priceCurrencyStr, priceCurrency } = priceCatcher.priceCatcher(body)
    const trend = await priceCompareToDb.priceCompareToDb(paramTitleString, price)
    paramPriceString = price
    paramPriceCurrency = priceCurrency
    paramPriceCurrencyString = priceCurrencyStr + trend

    // @ MENZA date catch
    const found = await dateCatcher.dateCatcher(body, true)

    // @ MENZA build output
    if (found === true) {
      paramValueString = dailyMenza
      paramValueString =
        '• Daily menu: ' +
        (await stringValueCleaner.stringValueCleaner(paramValueString, false)) +
        '\n_Főbb étel allergének: A — glutén, B — rákfélék, C — tojás, D — hal, E — földimogyoró, F — szója, G — tej, H — diófélék, I — zeller, J — mustár, K — szezámmag, L — kén-dioxid, M — csillagfürt, N — puhatestűek, V — vegán_'
    } else {
      paramValueString = '• Daily menu: ♪"No Milk Today"♫'
    }

    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString)
    console.log(paramPriceString + paramPriceCurrencyString + '\n')
    // @ MENZA object
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
