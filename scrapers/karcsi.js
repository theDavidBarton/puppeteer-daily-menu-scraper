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

const ocrSpaceApiSimple = require('./../lib/ocrSpaceApiSimple')
const replacementMap = require('./../replacementMap.json')
const today = require('./../scrapeDailyMenu').today
const finalJSON = require('./../scrapeDailyMenu').finalJSON
const finalMongoJSON = require('./../scrapeDailyMenu').finalMongoJSON
const RestaurantMenuOutput = require('./../scrapeDailyMenu').RestaurantMenuOutput
const RestaurantMenuDb = require('./../scrapeDailyMenu').RestaurantMenuDb

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
    'https://scontent.fbud1-1.fna.fbcdn.net/v/t1.0-1/c28.22.275.275a/p320x320/579633_527729393935258_751578746_n.png?_nc_cat=111&_nc_ht=scontent.fbud1-1.fna&oh=73791f008083bd39a006894bc54655d3&oe=5D61492B'
  let paramValueString
  let paramPriceString = '1100'
  let paramAddressString = 'Budapest, Jókai u. 20, 1066'

  // @ KARCSI weekly
  let pdfUrl = 'http://karcsibacsivendeglo.com/letoltes/napi_menu.pdf'
  let weeklyOfferRegex = /\bHETI MEN.:((.*\r?\n){3})/gi
  let soupRegex = /\bMENÜ 1((.*\r?\n){2})/gi
  let karcsiDaysRegexArray = [
    '',
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
      // format text and replace faulty string parts
      for (let j = 0; j < replacementMap.length; j++) {
        karcsiWeekly = karcsiWeekly
          .toString()
          .toLowerCase()
          .replace(/\bheti men.((.*\r?\n))|\bmen. 1((.*\r?\n))/gi, '')
          .replace(/[0-9]+ ft/gi, '')
          .replace(/\r?\n/g, ', ')
          .replace(new RegExp(replacementMap[j][0], 'g'), replacementMap[j][1])
        karcsiSoup = karcsiSoup
          .toString()
          .toLowerCase()
          .replace(/\bheti men.((.*\r?\n))|\bmen. 1((.*\r?\n))/gi, '')
          .replace(/[0-9]+ ft/gi, '')
          .replace(/\r?\n/g, ', ')
          .replace(new RegExp(replacementMap[j][0], 'g'), replacementMap[j][1])
        karcsiDaily = karcsiDaily
          .toString()
          .toLowerCase()
          .replace(/\bheti men.((.*\r?\n))|\bmen. 1((.*\r?\n))/gi, '')
          .replace(/[0-9]+ ft/gi, '')
          .replace(/\r?\n/g, ', ')
          .replace(new RegExp(replacementMap[j][0], 'g'), replacementMap[j][1])
      }
    }
    paramValueString = '• Weekly offer: ' + karcsiWeekly + '\n• Daily menu: ' + karcsiSoup + karcsiDaily + '\n'
    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString)
    // @ KARCSI object
    let karcsiObj = new RestaurantMenuOutput(
      paramColor,
      paramTitleString,
      paramUrl,
      paramIcon,
      paramValueString,
      paramPriceString,
      paramAddressString
    )
    let karcsiMongoObj = new RestaurantMenuDb(paramTitleString, paramPriceString, paramValueString)
    finalJSON.attachments.push(karcsiObj)
    finalMongoJSON.push(karcsiMongoObj)
  } catch (e) {
    console.error(e)
  }
}
module.exports.scraper = scraper
