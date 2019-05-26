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
const request = require('request')
const replacementMap = require('./../replacementMap.json')
const browserWSEndpoint = require('./../scrapeDailyMenu').browserWSEndpoint
const today = require('./../scrapeDailyMenu').today
const dayNames = require('./../scrapeDailyMenu').dayNames
const finalJSON = require('./../scrapeDailyMenu').finalJSON
const RestaurantMenuOutput = require('./../scrapeDailyMenu').RestaurantMenuOutput


// @ {RESTAURANT}s with only facebook image menus
async function ocrFacebookImage(
  paramColor,
  paramTitleString,
  paramUrl,
  paramIcon,
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
    // (I.) promise to return the parsedResult for processing
    function ocrRequest() {
      return new Promise(function(resolve, reject) {
        request(options, function(error, response, body) {
          try {
            resolve(JSON.parse(body).ParsedResults[0].ParsedText)
          } catch (e) {
            reject(e)
          }
        })
      })
    }
    // (II.)
    async function ocrResponse() {
      try {
        parsedResult = await ocrRequest()
      } catch (e) {
        console.error(e)
      }
    }
    try {
      // (III.)
      await ocrResponse()
      if (await parsedResult.match(paramMenuHandleRegex)) {
        // @ {RESTAURANT} Monday-Friday
        for (let j = today; j < today + 1; j++) {
          let restaurantDaily = parsedResult.match(restaurantDaysRegex[j])
          // format text and replace faulty string parts
          for (let k = 0; k < replacementMap.length; k++) {
            restaurantDaily = restaurantDaily
              .toString()
              .toLowerCase()
              .replace(new RegExp(replacementMap[k][0], 'g'), replacementMap[k][1])
          }
          restaurantDaily = restaurantDaily.split(/\r?\n/)

          for (let l = paramStartLine; l < paramEndLine + 1; l++) {
            restaurantDaily[l] = restaurantDaily[l].trim()
            restaurantDailyArray.push(restaurantDaily[l])
          }
          paramValueString = restaurantDailyArray.join(', ')
          console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
          console.log('• ' + dayNames[today] + ': ' + paramValueString + '\n')
          // @ {RESTAURANT} object
          let restaurantObj = new RestaurantMenuOutput(
            paramColor,
            paramTitleString,
            paramUrl,
            paramIcon,
            paramValueString
          )
          finalJSON.attachments.push(restaurantObj)

          break forlabelRestaurant
        }
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