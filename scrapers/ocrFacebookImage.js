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
const fs = require('fs')

/*
 * @paramStartLine : selects custom range on the matching regex
 * @paramEndline : selects custom range on the matching regex
 * @paramZoomIn : in case of extremely small letters this param enables reading full size images
 */

// @ {RESTAURANT}s with only facebook image menus
async function ocrFacebookImage(
  paramColor,
  paramTitleString,
  paramUrl,
  paramIcon,
  paramAddressString,
  paramDaysRegexArray,
  paramMenuHandleRegex
) {
  const browser = await puppeteer.connect({ browserWSEndpoint })
  const page = await browser.newPage()

  let paramValueString
  let paramPriceString
  let paramPriceCurrency
  let paramPriceCurrencyString
  let restaurantDaysRegex = paramDaysRegexArray
  let imageAltArray = []
  let parsedResult
  let obj = null
  let mongoObj = null

  try {
    console.log('facebook starts')
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36'
    )
    await page.goto(paramUrl, { waitUntil: 'networkidle0' })
    // @ {RESTAURANT} the hunt for the menu image src
    if ((await page.$$('input[name="email"]'))[0] !== null) {
      await page.type('input[name="email"]', process.env.FB_USERNAME)
      await page.type('input[name="password"]', process.env.FB_PASSWORD)
      await waitForTimeout(500)
      await page.click('button[name="login"]')
      await page.waitForNavigation()
      await page.goto(paramUrl, { waitUntil: 'networkidle0' })
    }
    imageAltArray = await page.$$eval('img', elems => elems.map(el => el.alt))
    console.log(imageAltArray)
    imageAltArray = imageAltArray.filter(el => el
      .match(/May be an image of text that says|Lehet, hogy egy kép erről/gi))
    console.log(imageAltArray)
    await page.screenshot({ path: __dirname + '/screen.png' })
    const screenBase64 = fs.readFileSync(__dirname + '/screen.png', 'base64')
    console.log('data:image/png;base64, ' + screenBase64)
  } catch (e) {
    console.error(e)
  }

  // @ {RESTAURANT} OCR (using fb's own OCR in alt tags)
  forlabelRestaurant: for (let i = 0; i < imageAltArray.length; i++) {
    console.log(imageAltArray)
    try {
      parsedResult = imageAltArray[i]
      // @ {RESTAURANT} Monday-Friday
      if (parsedResult.match(paramMenuHandleRegex)) {
        // @ {RESTAURANT} price catch
        let { price, priceCurrencyStr, priceCurrency } = priceCatcher.priceCatcher(parsedResult)
        let trend = await priceCompareToDb.priceCompareToDb(paramTitleString, price)
        paramPriceString = price
        paramPriceCurrency = priceCurrency
        paramPriceCurrencyString = priceCurrencyStr + trend

        let restaurantDaily = parsedResult.match(restaurantDaysRegex[today])
        if (restaurantDaily === null) {
          console.log(
            paramTitleString + ' parsed result is: ' + restaurantDaily + ' at ' + i + 'th matching image'
          )
          continue forlabelRestaurant
        }

        ;[paramValueString] = parsedResult.match(restaurantDaysRegex[today])
        // @ {RESTAURANT} clean string
        paramValueString = '• Daily menu: ' + (await stringValueCleaner.stringValueCleaner(paramValueString, true))
        console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
        console.log(paramValueString)
        console.log(paramPriceString + paramPriceCurrencyString + '\n')
        // @ {RESTAURANT} object
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

        break forlabelRestaurant
      }
    } catch (e) {
      console.error(e)
    }
  }
  await page.goto('about:blank')
  await page.close()
  await browser.disconnect()
}
module.exports.ocrFacebookImage = ocrFacebookImage
