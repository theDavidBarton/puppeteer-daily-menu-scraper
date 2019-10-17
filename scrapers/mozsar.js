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
const objectDecider = require('./../lib/objectDecider')
const priceCatcher = require('./../lib/priceCatcher')
const priceCompareToDb = require('./../lib/priceCompareToDb')
const browserWSEndpoint = require('./../scrapeDailyMenu').browserWSEndpoint
const today = require('./../scrapeDailyMenu').today
const finalJSON = require('./../scrapeDailyMenu').finalJSON
const finalMongoJSON = require('./../scrapeDailyMenu').finalMongoJSON
const RestaurantMenuOutput = require('./../scrapeDailyMenu')
  .RestaurantMenuOutput
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
   * @ mozsar
   * ------------------------------------------
   * contact info:
   * Address: Budapest, Nagymező u. 14, 1065
   * Phone: (1) 343 1984
   * -----------------------------------------
   * description:
   * mozsarArray[1-2]: contains selectors for tha days of the week
   * mozsar[1-2]: is the text inside selector (actual menu) to be displayed in output
   */

  // @ mozsar parameters
  let paramColor = '#000000'
  let paramTitleString = 'Mozsár Bisztro'
  let paramUrl = 'http://mozsarbisztro.hu/index.php?p=3'
  let paramIcon =
    'https://images.deliveryhero.io/image/netpincer/caterer/sh-9a3e84d0-2e42-11e2-9d48-7a92eabdcf20/logo.png'
  let paramValueString
  let paramPriceString
  let paramPriceCurrency
  let paramPriceCurrencyString
  let paramAddressString = 'Budapest, Nagymező u. 14, 1065'
  let mozsar1
  let mozsar2
  let found
  let obj = null
  let mongoObj = null

  // @ mozsar selectors [1: first course, 2: main course]
  let mozsarArray1 = [
    '',
    'p:nth-child(4)',
    'p:nth-child(7)',
    'p:nth-child(10)',
    'p:nth-child(13)',
    'p:nth-child(16)'
  ]
  let mozsarArray2 = [
    '',
    'p:nth-child(5)',
    'p:nth-child(8)',
    'p:nth-child(11)',
    'p:nth-child(14)',
    'p:nth-child(17)'
  ]

  try {
    await page.goto(paramUrl, { waitUntil: 'networkidle2' })
    // @ mozsar Monday-Friday
    found = await dateCatcher.dateCatcher(weeklyI55, true) // @ I55 catch date
    if (found === true) {
      paramValueString = await stringValueCleaner.stringValueCleaner(
        weeklyI55Daily,
        false
      )
      paramValueString = paramValueString
        .replace(/\(\)/g, '')
        .replace(/\n/, ' ') // to be moved to stringValueCleaner module later!

      // fallback on facebook page
    } else {
      await page.goto(paramUrlFallback, {
        waituntil: 'domcontentloaded',
        timeout: 0
      })
      forlabel: for (let i = 0; i < 10; i++) {
        weeklyI55 = await page.evaluate(
          el => el.textContent,
          (await page.$$(weeklyI55SelectorFallback))[i]
        )
        if (weeklyI55.match(/levesek([\s\S]*?)ebédelj/gi)) {
          weeklyI55Daily = weeklyI55.match(/levesek([\s\S]*?)ebédelj/gi)
          paramPriceString = await priceCatcher.priceCatcher(weeklyI55, 1) // @ I55 price catch
          found = await dateCatcher.dateCatcher(weeklyI55, true) // @ I55 catch date
          if (found === true) {
            paramValueString = await stringValueCleaner.stringValueCleaner(
              weeklyI55Daily,
              false
            )
            paramValueString = paramValueString
              .replace(/\(\)/g, '')
              .replace(/\n/, ' ') // to be moved to stringValueCleaner module later!
            break forlabel
          } else {
            paramValueString = 'menu is out of date!'
          }
        }
      }
    }
    let trend = await priceCompareToDb.priceCompareToDb(paramTitleString, price)
    console.log(
      '*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length)
    )
    console.log(paramValueString)
    console.log(paramPriceString + paramPriceCurrencyString + '\n')
    // @ mozsar object
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
