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

const objectDecider = require('./../lib/objectDecider')
const ocrSpaceApiSimple = require('./../lib/ocrSpaceApiSimple')
const stringValueCleaner = require('./../lib/stringValueCleaner')
const priceCompareToDb = require('./../lib/priceCompareToDb')
const today = require('./../src/date').date.today
const finalJSON = require('./../src/dailyMenuScraper').finalJSON
const finalMongoJSON = require('./../src/dailyMenuScraper').finalMongoJSON
const RestaurantMenuOutput = require('./../src/restaurantMenuClasses').RestaurantMenuOutput
const RestaurantMenuDb = require('./../src/restaurantMenuClasses').RestaurantMenuDb

async function scraper() {
  /*
   * @ KARCSI
   * ------------------------------------------
   * contact info:
   * Address: Budapest, Jókai u. 20, 1066
   * Phone: (1) 312 0557
   * -----------------------------------------
   */

  // @ KARCSI parameters
  let paramColor = '#ffba44'
  let paramTitleString = 'Karcsi Vendéglö'
  let paramUrl = 'http://karcsibacsivendeglo.com/letoltes/napi_menu.pdf'
  let paramIcon =
    'https://6.kerulet.ittlakunk.hu/files/ittlakunk/styles/large/public/upload/company/1256/karcsi_vendeglo_logo.png'
  let paramValueString
  let paramPriceString = '1100'
  let paramPriceCurrency = 'n/a'
  let paramPriceCurrencyString = ' Ft'
  let paramAddressString = 'Budapest, Jókai u. 20, 1066'

  // @ KARCSI weekly
  let pdfUrl = 'http://karcsibacsivendeglo.com/letoltes/napi_menu.pdf'
  let weeklyOfferRegex = /\bHETI MEN.:((.*\r?\n){3})/gi
  let soupRegex = /\bMENÜ 1((.*\r?\n){2})/gi
  let karcsiDaysRegexArray = [
    null,
    /\bHÉT((.*\r?\n))/gi,
    /\bKED((.*\r?\n))/gi,
    /\bSZERD((.*\r?\n))/gi,
    /\bCSÜ((.*\r?\n))/gi,
    /\bPÉNT((.*\r?\n))/gi
  ]
  let karcsiWeekly
  let karcsiSoup
  let karcsiDaily
  let parsedResult
  let obj = null
  let mongoObj = null

  const options = {
    method: 'POST',
    url: 'https://api.ocr.space/parse/image',
    headers: {
      apikey: process.env.OCR_API_KEY
    },
    formData: {
      language: 'hun',
      isOverlayRequired: 'true',
      url: pdfUrl,
      scale: 'true',
      isTable: 'true'
    }
  }
  try {
    parsedResult = await ocrSpaceApiSimple.ocrSpaceApiSimple(options)
    parsedResult = parsedResult.ParsedText

    for (let i = today; i < today + 1; i++) {
      karcsiDaily = parsedResult.match(karcsiDaysRegexArray[i])
      karcsiWeekly = parsedResult.match(weeklyOfferRegex)
      karcsiSoup = parsedResult.match(soupRegex)
    }
    let trend = await priceCompareToDb.priceCompareToDb(paramTitleString, paramPriceString)
    paramPriceCurrencyString = paramPriceCurrencyString + trend
    // @ KARCSI clean string
    paramValueString =
      '• Weekly offer: ' +
      (await stringValueCleaner.stringValueCleaner(karcsiWeekly, true)) +
      '\n• Daily menu: ' +
      (await stringValueCleaner.stringValueCleaner(karcsiSoup, true)) +
      (await stringValueCleaner.stringValueCleaner(karcsiDaily, true))
    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString)
    console.log(paramPriceString + paramPriceCurrencyString + '\n')
    // @ KARCSI object
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
}
module.exports.scraper = scraper
