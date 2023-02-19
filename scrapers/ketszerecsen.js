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
   * @ KETSZERECSEN
   * ------------------------------------------
   * contact info:
   * Address: Budapest, Nagymező u. 14, 1065
   * Phone: (1) 343 1984
   * -----------------------------------------
   * description:
   * ketszerecsenArray[1-2]: contains selectors for tha days of the week
   * ketszerecsen[1-2]: is the text inside selector (actual menu) to be displayed in output
   */

  // @ KETSZERECSEN parameters
  let paramColor = '#000000'
  let paramTitleString = 'Két Szerecsen Bisztro'
  let paramUrl = 'https://ketszerecsen.hu/#daily'
  let paramIcon = 'https://images.deliveryhero.io/image/netpincer/caterer/sh-9a3e84d0-2e42-11e2-9d48-7a92eabdcf20/logo.png'
  let paramValueString
  let paramPriceString
  let paramPriceCurrency
  let paramPriceCurrencyString
  let paramAddressString = 'Budapest, Nagymező u. 14, 1065'
  let ketszerecsen
  let obj = null
  let mongoObj = null

  // @ KETSZERECSEN RegEx expressions
  const ketszerecsenArray = [
    null,
    /hétfő((.*)\r?\n+){4}/gim,
    /kedd((.*)\r?\n+){4}/gim,
    /szerda((.*)\r?\n+){4}/gim,
    /csütörtök((.*)\r?\n+){4}/gim,
    /péntek((.*)\r?\n+){4}/gim
  ]

  try {
    await page.goto(paramUrl, { waitUntil: 'networkidle2' })
    const body = await page.evaluate(el => el.innerText, (await page.$$('body'))[0])
    // @ KETSZERECSEN Monday-Friday
    body.match(ketszerecsenArray[today])
      ? (ketszerecsen = body.match(ketszerecsenArray[today])[0])
      : (ketszerecsen = '♪"No Milk Today"♫')

    // @ KETSZERECSEN price catch
    console.log('\n')
    const { price, priceCurrencyStr, priceCurrency } = priceCatcher.priceCatcher(body)
    const trend = await priceCompareToDb.priceCompareToDb(paramTitleString, price)
    paramPriceString = price
    paramPriceCurrency = priceCurrency
    paramPriceCurrencyString = priceCurrencyStr + trend

    paramValueString = '• Daily menu: ' + (await stringValueCleaner.stringValueCleaner(ketszerecsen, true))
    paramValueString += '\n_Rövidítések: GM — gluténmentes, LM — laktózmentes_'
    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString)
    console.log(paramPriceString + paramPriceCurrencyString + '\n')
    // @ KETSZERECSEN object
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
