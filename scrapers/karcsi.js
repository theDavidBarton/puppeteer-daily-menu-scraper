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
