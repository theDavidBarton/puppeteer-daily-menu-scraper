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
const priceCompareToDb = require('./../lib/priceCompareToDb')
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
   * @ FRUCCOLA
   * ----------------------------------------------
   * contact info:
   * Address: Budapest, Arany János u. 32, 1051
   * Phone: (1) 430 6125
   * ----------------------------------------------
   */

  // @ FRUCCOLA parameters
  let paramColor = '#40ae49'
  let paramTitleString = 'Fruccola (Arany Janos utca)'
  let paramUrl = 'http://fruccola.hu/hu'
  let paramIcon = 'https://pbs.twimg.com/profile_images/295153467/fruccola_logo_rgb.png'
  let paramValueString
  let paramPriceString
  let paramPriceCurrency = 'HUF'
  let paramPriceCurrencyString = ' Ft'
  let paramAddressString = 'Budapest, Arany János u. 32, 1051'
  let dailyFruccola1
  let dailyFruccola2
  let obj = null
  let mongoObj = null

  // @ FRUCCOLA selectors
  const dailyFruccolaSelector1 = '#dailymenu-holder > li.arany.today > div.soup > p.description'
  const dailyFruccolaSelector2 = '#dailymenu-holder > li.arany.today > div.main-dish > p.description'

  try {
    await page.goto(paramUrl, { waitUntil: 'networkidle2' })
    // @ FRUCCOLA Daily
    dailyFruccola1 = await page.evaluate(el => el.innerText, await page.$(dailyFruccolaSelector1))
    dailyFruccola2 = await page.evaluate(el => el.innerText, await page.$(dailyFruccolaSelector2))
    paramPriceString = await page.evaluate(el => el.innerText, (await page.$$('.soup-and-maindish > .price'))[0]) // @ FRUCCOLA price catch
    let trend = await priceCompareToDb.priceCompareToDb(paramTitleString, paramPriceString)
    paramPriceCurrencyString = paramPriceCurrencyString + trend
    paramValueString = '• Daily menu: ' + dailyFruccola1 + ', ' + dailyFruccola2
    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString)
    console.log(paramPriceString + paramPriceCurrencyString + '\n')
    // @ FRUCCOLA object
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
    mongoObj = new RestaurantMenuDb(
      paramTitleString,
      paramPriceString,
      paramPriceCurrency,
      paramValueString
    )
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
