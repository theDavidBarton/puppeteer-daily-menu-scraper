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
const dateCatcher = require('./../lib/dateCatcher')
const priceCatcher = require('./../lib/priceCatcher')
const stringValueCleaner = require('./../lib/stringValueCleaner')
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
   * @ KORHELY
   * ---------------------------------------------
   * contact info:
   * Address: Budapest, Liszt Ferenc tér 7, 1061
   * Phone: (1) 321 0280
   * ---------------------------------------------
   */

  // @ KORHELY parameters
  let paramColor = '#c6b443'
  let paramTitleString = 'Korhely'
  let paramUrl = 'http://www.korhelyfaloda.hu/menu'
  let paramIcon = 'https://etterem.hu/img/max960/p9787n/1393339359-3252.jpg'
  let paramValueString
  let paramPriceString
  let paramPriceCurrency
  let paramPriceCurrencyString
  let paramAddressString = 'Budapest, Liszt Ferenc tér 7, 1061'
  let weeklySoupKorhely, weeklyMainKorhely, weeklyDessertKorhely, found

  // @ KORHELY selectors
  const summarySelector = '.MenusNavigation_description'
  const weeklySoupKorhelySelector = '#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(1)'
  const weeklyMainKorhelySelector = '#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(2)'
  const weeklyDessertKorhelySelector = '#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(3)'

  try {
    await page.goto(paramUrl, { waitUntil: 'networkidle2', timeout: 0 })
    let linkSelectorKorhely = '#TPASection_ije2yufiiframe'
    const linkKorhely = await page.evaluate(el => el.src, await page.$(linkSelectorKorhely))
    await page.goto(linkKorhely, { waitUntil: 'networkidle2', timeout: 0 })
  } catch (e) {
    console.error(e)
  }
  // @ KORHELY Weekly
  try {
    const summary = await page.evaluate(el => el.textContent, (await page.$$(summarySelector))[1])
    // @ KORHELY price catch
    let { price, priceCurrencyStr, priceCurrency } = await priceCatcher.priceCatcher(summary)
    paramPriceString = price
    paramPriceCurrency = priceCurrency
    paramPriceCurrencyString = priceCurrencyStr

    found = await dateCatcher.dateCatcher(summary, true)
    if (found === true) {
      weeklySoupKorhely = await page.evaluate(el => el.innerText, await page.$(weeklySoupKorhelySelector))
      weeklyMainKorhely = await page.evaluate(el => el.innerText, await page.$(weeklyMainKorhelySelector))
      weeklyDessertKorhely = await page.evaluate(el => el.innerText, await page.$(weeklyDessertKorhelySelector))

      paramValueString =
        '• Soups: ' +
        (await stringValueCleaner.stringValueCleaner(weeklySoupKorhely, false)) +
        '\n' +
        '• Main courses: ' +
        (await stringValueCleaner.stringValueCleaner(weeklyMainKorhely, false)) +
        '\n' +
        '• Desserts: ' +
        (await stringValueCleaner.stringValueCleaner(weeklyDessertKorhely, false))
    } else {
      paramValueString = 'menu is outdated!'
    }

    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString)
    console.log(paramPriceString + paramPriceCurrencyString + '\n')
    // @ KORHELY object
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
