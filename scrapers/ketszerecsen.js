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
  let ketszerecsen1
  let ketszerecsen2
  let obj = null
  let mongoObj = null

  // @ KETSZERECSEN selectors [1: first course, 2: main course]
  let ketszerecsenArray1 = [null, 'p:nth-child(4)', 'p:nth-child(7)', 'p:nth-child(10)', 'p:nth-child(13)', 'p:nth-child(16)']
  let ketszerecsenArray2 = [null, 'p:nth-child(5)', 'p:nth-child(8)', 'p:nth-child(11)', 'p:nth-child(14)', 'p:nth-child(17)']

  try {
    await page.goto(paramUrl, { waitUntil: 'networkidle2' })
    // @ KETSZERECSEN Monday-Friday
    for (let i = today; i < today + 1; i++) {
      if ((await page.$(ketszerecsenArray1[i])) !== null) {
        ketszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$(ketszerecsenArray1[i]))
        ketszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$(ketszerecsenArray2[i]))
      } else {
        ketszerecsen1 = '♪"No Milk Today"♫'
        ketszerecsen2 = ''
      }

      const body = await page.evaluate(el => el.textContent, (await page.$$('body'))[0])
      // @ KETSZERECSEN price catch
      let { price, priceCurrencyStr, priceCurrency } = await priceCatcher.priceCatcher(body)
      let trend = await priceCompareToDb.priceCompareToDb(paramTitleString, price)
      paramPriceString = price
      paramPriceCurrency = priceCurrency
      paramPriceCurrencyString = priceCurrencyStr + trend

      paramValueString = '• Daily menu: ' + ketszerecsen1 + ', ' + ketszerecsen2
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
    }
  } catch (e) {
    console.error(e)
  }
  await page.goto('about:blank')
  await page.close()
  await browser.disconnect()
}
module.exports.scraper = scraper
