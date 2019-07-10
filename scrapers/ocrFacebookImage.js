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
const ocrSpaceApiSimple = require('./../lib/ocrSpaceApiSimple')
const priceCatcher = require('./../lib/priceCatcher')
const priceCompareToDb = require('./../lib/priceCompareToDb')
const stringValueCleaner = require('./../lib/stringValueCleaner')
const browserWSEndpoint = require('./../scrapeDailyMenu').browserWSEndpoint
const today = require('./../scrapeDailyMenu').today
const finalJSON = require('./../scrapeDailyMenu').finalJSON
const finalMongoJSON = require('./../scrapeDailyMenu').finalMongoJSON
const RestaurantMenuOutput = require('./../scrapeDailyMenu').RestaurantMenuOutput
const RestaurantMenuDb = require('./../scrapeDailyMenu').RestaurantMenuDb

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
  paramEndLine
) {
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

  let paramValueString
  let paramPriceString
  let paramPriceCurrency
  let paramPriceCurrencyString
  let restaurantDaysRegex = paramDaysRegexArray
  let imageUrlArray = []
  let restaurantDailyArray = []
  let parsedResult
  try {
    await page.goto(paramUrl, { waitUntil: 'domcontentloaded' })
    // @ {RESTAURANT} the hunt for the menu image src
    const facebookImageUrl = await page.$$(paramFacebookImageUrlSelector)
    for (let i = 0; i < facebookImageUrl.length; i++) {
      let imageUrl = await page.evaluate(el => el.src, facebookImageUrl[i])
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
        let mongoObj = new RestaurantMenuDb(paramTitleString, paramPriceString, paramPriceCurrency, paramValueString)
        finalJSON.attachments.push(obj)
        finalMongoJSON.push(mongoObj)

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
