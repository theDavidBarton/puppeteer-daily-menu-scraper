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
const objectDecider = require('./../lib/objectDecider')
const priceCompareToDb = require('./../lib/priceCompareToDb')
const browserWSEndpoint = require('./../scrapeDailyMenu').browserWSEndpoint
const today = require('./../scrapeDailyMenu').date.today
const dayNames = require('./../scrapeDailyMenu').date.dayNames
const finalJSON = require('./../scrapeDailyMenu').finalJSON
const finalMongoJSON = require('./../scrapeDailyMenu').finalMongoJSON
const RestaurantMenuOutput = require('./../src/restaurantMenuClasses').RestaurantMenuOutput
const RestaurantMenuDb = require('./../src/restaurantMenuClasses').RestaurantMenuDb

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
   * @ SUPPÉ bistro
   * ---------------------------------------
   * contact info:
   * Address: Hajós u. 19 (19.45 mi), Budapest, Hungary 1065
   * Phone: (70) 336 0822
   * ---------------------------------------
   * Description:
   * scrape facebook posts based on xpath patterns
   * todo: avoid xpath and use selectors
   * replace redundant string patterns with regex
   */

  // @ SUPPÉ parameters
  let paramColor = '#b5dd8d'
  let paramTitleString = 'Bistro Suppé'
  let paramUrl = 'https://www.facebook.com/pg/bistrosuppe/posts/'
  let paramIcon =
    'https://scontent.fbud5-1.fna.fbcdn.net/v/t1.0-9/1377248_364465010354681_215635093_n.jpg?_nc_cat=101&_nc_oc=AQm91PjrSi-ey80DSDwdQ3M3QHzUeuVWy-oElgtNm3nn2HdoSNFxNcRZGwQPDG2Hkmo&_nc_ht=scontent.fbud5-1.fna&oh=925e1c2bb1782f4ab82cd02ef911ecc1&oe=5E254656'
  let paramValueString
  let paramPriceString = '1190'
  let paramPriceCurrency = 'HUF'
  let paramPriceCurrencyString = ' Ft'
  let paramAddressString = 'Budapest, Hajós u. 19, 1065'
  let mondaySuppe
  let dailySuppe
  let weeklySuppe
  let obj = null
  let mongoObj = null

  try {
    await page.goto(paramUrl, { waitUntil: 'networkidle2' })
    /*
     * @ SUPPÉ selector, source: https://stackoverflow.com/questions/48448586/how-to-use-xpath-in-chrome-headlesspuppeteer-evaluate
     * @ SUPPÉ Daily
     */
    const dailySuppeIncludes = (await page.$x('//span[contains(text(), "Sziasztok")]'))[0]
    dailySuppe = await page.evaluate(el => el.textContent, dailySuppeIncludes)
    dailySuppe = dailySuppe.replace(/Sziasztok, |, kellemes hétvégét!|, szép napot!|, várunk Titeket!/gi, '')
    // @ SUPPÉ Weekly (on Monday)
    const weeklySuppeIncludes = (await page.$x('//p[contains(text(), "Sziasztok")]'))[0]
    weeklySuppe = await page.evaluate(el => el.textContent, weeklySuppeIncludes)
    weeklySuppe = weeklySuppe.replace(/(?=sziasztok)(.*)(?=levesek )|(?=mai)(.*)(?=\s*)/gi, '')
    // @ SUPPÉ Monday only (on Monday)
    const mondaySuppeIncludes = (await page.$x('//p[contains(text(), "Sziasztok")]'))[0]
    mondaySuppe = await page.evaluate(el => el.textContent, mondaySuppeIncludes)
    mondaySuppe = mondaySuppe.replace(/(?=sziasztok)(.*)(?=levesek )|(, várunk Titeket!)/gi, '')

    let trend = await priceCompareToDb.priceCompareToDb(paramTitleString, paramPriceString)
    paramPriceCurrencyString = paramPriceCurrencyString + trend

    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    if (today === 1) {
      paramValueString = mondaySuppe
      console.log('• ' + dayNames[today] + ': ' + paramValueString)
    } else {
      paramValueString = dailySuppe + '\n' + weeklySuppe
      console.log('• ' + dayNames[today] + ': ' + paramValueString)
    }
    console.log(paramPriceString + paramPriceCurrencyString + '\n')
    // @ SUPPÉ object
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
  await page.goto('about:blank')
  await page.close()
  await browser.disconnect()
}
module.exports.scraper = scraper
