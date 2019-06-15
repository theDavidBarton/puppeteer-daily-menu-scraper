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
const browserWSEndpoint = require('./../scrapeDailyMenu').browserWSEndpoint
const today = require('./../scrapeDailyMenu').today
const dayNames = require('./../scrapeDailyMenu').dayNames
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
    'https://scontent.fbud1-1.fna.fbcdn.net/v/t1.0-1/c36.0.320.320a/p320x320/1377248_364465010354681_215635093_n.jpg?_nc_cat=101&_nc_ht=scontent.fbud1-1.fna&oh=2e5b2ffdede3a0606b410ca121409f27&oe=5D5F0B90'
  let paramValueString
  let mondaySuppe, dailySuppe, weeklySuppe

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

    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    if (today === 1) {
      paramValueString = mondaySuppe + '\n'
      console.log('• ' + dayNames[today] + ': ' + paramValueString)
    } else {
      paramValueString = dailySuppe + '\n' + weeklySuppe + '\n'
      console.log('• ' + dayNames[today] + ': ' + paramValueString)
    }
    // @ SUPPÉ object
    let suppeObj = new RestaurantMenuOutput(paramColor, paramTitleString, paramUrl, paramIcon, paramValueString)
    let suppeMongoObj = new RestaurantMenuDb(paramTitleString, paramValueString)
    finalJSON.attachments.push(suppeObj)
    finalMongoJSON.restaurants.push(suppeMongoObj)
  } catch (e) {
    console.error(e)
  }
  await page.goto('about:blank')
  await page.close()
  await browser.disconnect()
}
module.exports.scraper = scraper
