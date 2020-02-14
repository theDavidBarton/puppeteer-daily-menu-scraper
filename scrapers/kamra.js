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
   * @ KAMRA
   * ------------------------------------------
   * contact info:
   * Address: Budapest, Hercegprímás u. 19, 1051
   * Phone: (20) 436 9968
   * -----------------------------------------
   */

  // @ KAMRA parameters
  let paramColor = '#fc594e'
  let paramTitleString = 'Kamra Ételbár'
  let paramUrl = 'http://www.kamraetelbar.hu/kamra_etelbar_mai_menu.html'
  let paramIcon = 'https://media-cdn.tripadvisor.com/media/photo-s/06/f5/9b/24/getlstd-property-photo.jpg'
  let paramValueString
  let paramPriceString
  let paramPriceCurrency
  let paramPriceCurrencyString
  let paramAddressString = 'Budapest, Hercegprímás u. 19, 1051'
  let dailyKamra = []
  let obj = null
  let mongoObj = null

  // @ KAMRA selectors
  const dayKamraSelector = '.shop_today_1'
  const dailyKamraSelector = '.shop_today_title'

  try {
    await page.goto(paramUrl, { waitUntil: 'networkidle2' })
    // @ KAMRA Daily
    const dayKamra = await page.evaluate(el => el.innerText, await page.$(dayKamraSelector))
    const dailyKamraSelectorLength = (await page.$$(dailyKamraSelector)).length
    for (let i = 0; i < dailyKamraSelectorLength; i++) {
      let dailyKamraItem = await page.evaluate(el => el.innerText, (await page.$$(dailyKamraSelector))[i])
      dailyKamra.push(dailyKamraItem)
    }
    dailyKamra = dailyKamra.join(', ')
    // @ KAMRA price catch
    let { price, priceCurrencyStr, priceCurrency } = await priceCatcher.priceCatcher(dailyKamra)
    let trend = await priceCompareToDb.priceCompareToDb(paramTitleString, price)
    paramPriceString = price
    paramPriceCurrency = priceCurrency
    paramPriceCurrencyString = priceCurrencyStr + trend

    paramValueString = '• Daily menu: ' + dailyKamra
    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(dayKamra + paramValueString)
    console.log(paramPriceString + paramPriceCurrencyString + '\n')
    // @ KAMRA object
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
