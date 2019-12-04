/*
 * copyright 2019, David Barton (theDavidBarton)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const puppeteer = require('puppeteer')
const objectDecider = require('./../lib/objectDecider')
const priceCatcher = require('./../lib/priceCatcher')
const priceCompareToDb = require('./../lib/priceCompareToDb')
const browserWSEndpoint = require('./../scrapeDailyMenu').browserWSEndpoint
const today = require('./../src.date').today
const finalJSON = require('./../scrapeDailyMenu').finalJSON
const finalMongoJSON = require('./../scrapeDailyMenu').finalMongoJSON
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
  let paramIcon =
    'https://images.deliveryhero.io/image/netpincer/caterer/sh-9a3e84d0-2e42-11e2-9d48-7a92eabdcf20/logo.png'
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
  let ketszerecsenArray1 = [
    null,
    'p:nth-child(4)',
    'p:nth-child(7)',
    'p:nth-child(10)',
    'p:nth-child(13)',
    'p:nth-child(16)'
  ]
  let ketszerecsenArray2 = [
    null,
    'p:nth-child(5)',
    'p:nth-child(8)',
    'p:nth-child(11)',
    'p:nth-child(14)',
    'p:nth-child(17)'
  ]

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
