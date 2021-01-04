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
const ocrSpaceApiSimple = require('./../lib/ocrSpaceApiSimple')
const priceCatcher = require('./../lib/priceCatcher')
const priceCompareToDb = require('./../lib/priceCompareToDb')
const stringValueCleaner = require('./../lib/stringValueCleaner')
const browserWSEndpoint = require('./../src/index').browserWSEndpoint
const today = require('./../src/date').date.today
const finalJSON = require('./../src/index').finalJSON
const finalMongoJSON = require('./../src/index').finalMongoJSON
const RestaurantMenuOutput = require('./../src/restaurantMenuClasses').RestaurantMenuOutput
const RestaurantMenuDb = require('./../src/restaurantMenuClasses').RestaurantMenuDb

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
  paramFacebookImageUrlSelector,
  paramMenuHandleRegex,
  paramStartLine,
  paramEndLine,
  paramZoomIn
) {
  const browser = await puppeteer.connect({ browserWSEndpoint })
  const page = await browser.newPage()

  let paramValueString
  let paramPriceString
  let paramPriceCurrency
  let paramPriceCurrencyString
  let restaurantDaysRegex = paramDaysRegexArray
  let imageUrlArray = []
  let restaurantDailyArray = []
  let parsedResult
  let obj = null
  let mongoObj = null

  try {
    await page.goto(paramUrl, { waitUntil: 'networkidle0' })
    // @ {RESTAURANT} the hunt for the menu image src
    const facebookImageUrl = await page.$$(paramFacebookImageUrlSelector)
    for (let i = 0; i < 6; i++) {
      // limited to six runs to save OCR resources
      let imageUrl
      await page.waitFor(3000)
      if (paramZoomIn) {
        await facebookImageUrl[1].click()
        await page.waitForSelector('.spotlight')
        imageUrl = await page.evaluate(el => el.src, (await page.$$('.spotlight'))[0])
      } else {
        imageUrl = await page.evaluate(el => el.src, facebookImageUrl[i])
      }
      imageUrlArray.push(imageUrl)
    }
  } catch (e) {
    console.error(e)
  }
  // @ {RESTAURANT} OCR https://ocr.space/ocrapi#PostParameters
  forlabelRestaurant: for (let i = 0; i < imageUrlArray.length; i++) {
    const options = {
      method: 'POST',
      url: 'https://api.ocr.space/parse/image',
      headers: {
        apikey: process.env.OCR_API_KEY
      },
      formData: {
        language: 'hun',
        isOverlayRequired: 'true',
        url: imageUrlArray[i],
        scale: 'true',
        isTable: 'true'
      }
    }
    try {
      parsedResult = await ocrSpaceApiSimple.ocrSpaceApiSimple(options)
      parsedResult = parsedResult.ParsedText
      // @ {RESTAURANT} Monday-Friday
      if (await parsedResult.match(paramMenuHandleRegex)) {
        // @ {RESTAURANT} price catch
        let { price, priceCurrencyStr, priceCurrency } = await priceCatcher.priceCatcher(parsedResult)
        let trend = await priceCompareToDb.priceCompareToDb(paramTitleString, price)
        paramPriceString = price
        paramPriceCurrency = priceCurrency
        paramPriceCurrencyString = priceCurrencyStr + trend

        let restaurantDaily = parsedResult.match(restaurantDaysRegex[today])
        if (restaurantDaily === null) {
          console.log(paramTitleString + ' parsed result is: ' + restaurantDaily + ' at ' + i + 'th matching image')
          continue forlabelRestaurant
        }
        restaurantDaily = restaurantDaily.toString().split(/\r?\n/)
        for (let j = paramStartLine; j < paramEndLine + 1; j++) {
          restaurantDailyArray.push(restaurantDaily[j])
        }

        paramValueString = restaurantDailyArray.join(', ')
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
