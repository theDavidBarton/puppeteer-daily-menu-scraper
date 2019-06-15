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
  let weeklySoupKorhely, weeklyMainKorhely, weeklyDessertKorhely

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
    paramPriceString = await priceCatcher.priceCatcher(summary) // @ KORHELY price catch
    weeklySoupKorhely = await page.evaluate(el => el.innerText, await page.$(weeklySoupKorhelySelector))
    weeklySoupKorhely = weeklySoupKorhely.replace('LEVESEK', '')
    weeklyMainKorhely = await page.evaluate(el => el.innerText, await page.$(weeklyMainKorhelySelector))
    weeklyMainKorhely = weeklyMainKorhely.replace('FŐÉTELEK', '')
    weeklyDessertKorhely = await page.evaluate(el => el.innerText, await page.$(weeklyDessertKorhelySelector))
    weeklyDessertKorhely = weeklyDessertKorhely.replace('DESSZERTEK', '')

    paramValueString =
      '• Soups: ' +
      weeklySoupKorhely +
      '\n' +
      '• Main courses: ' +
      weeklyMainKorhely +
      '\n' +
      '• Desserts: ' +
      weeklyDessertKorhely +
      '\n'
    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString)
    // @ KORHELY object
    let korhelyObj = new RestaurantMenuOutput(
      paramColor,
      paramTitleString,
      paramUrl,
      paramIcon,
      paramValueString,
      paramPriceString
    )
    let korhelyMongoObj = new RestaurantMenuDb(paramTitleString, paramPriceString, paramValueString)
    finalJSON.attachments.push(korhelyObj)
    finalMongoJSON.push(korhelyMongoObj)
  } catch (e) {
    console.error(e)
  }
  await page.goto('about:blank')
  await page.close()
  await browser.disconnect()
}
module.exports.scraper = scraper
