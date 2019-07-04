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
const priceCatcher = require('./../lib/priceCatcher')
const browserWSEndpoint = require('./../scrapeDailyMenu').browserWSEndpoint
const finalJSON = require('./../scrapeDailyMenu').finalJSON
const finalMongoJSON = require('./../scrapeDailyMenu').finalMongoJSON
const RestaurantMenuOutput = require('./../scrapeDailyMenu').RestaurantMenuOutput
const RestaurantMenuDb = require('./../scrapeDailyMenu').RestaurantMenuDb

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
    paramPriceString = price
    paramPriceCurrency = priceCurrency
    paramPriceCurrencyString = priceCurrencyStr

    paramValueString = '• Daily menu: ' + dailyKamra
    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(dayKamra + paramValueString)
    console.log(paramPriceString + paramPriceCurrencyString + '\n')
    // @ KAMRA object
    let obj = new RestaurantMenuOutput(
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
    let mongoObj = new RestaurantMenuDb(
      paramTitleString,
      paramPriceString,
      paramPriceCurrency,
      paramValueString
    )
    finalJSON.attachments.push(obj)
    finalMongoJSON.push(mongoObj)
  } catch (e) {
    console.error(e)
  }
  await page.goto('about:blank')
  await page.close()
  await browser.disconnect()
}
module.exports.scraper = scraper
