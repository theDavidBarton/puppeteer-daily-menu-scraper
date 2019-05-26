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
const moment = require('moment')
const browserWSEndpoint = require('./../scrapeDailyMenu').browserWSEndpoint
const today = require('./../scrapeDailyMenu').today
const todayDotSeparated = require('./../scrapeDailyMenu').todayDotSeparated
const finalJSON = require('./../scrapeDailyMenu').finalJSON
const RestaurantMenuOutput = require('./../scrapeDailyMenu').RestaurantMenuOutput

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
   * @ YAMATO
   * ---------------------------------------
   * contact info:
   * Address: Budapest, 1066, JÓKAI U. 30.
   * Phone: +36(70)681-75-44
   * ---------------------------------------
   * description:
   * yamatoArray: contains selectors for tha days of the week
   * yamato: is the text inside selector (actual menu), and also the final cleaned text to be displayed in output
   */

  // @ YAMATO parameters
  let paramColor = '#cca92b'
  let paramTitleString = 'Yamato'
  let paramUrl = 'https://www.wasabi.hu/napimenu.php?source=yamato&lang=hu'
  let paramIcon = 'http://yamatorestaurant.hu/wp-content/uploads/2014/12/yamato_logo_retina.png'
  let paramValueString
  let yamato

  // @ YAMATO selectors
  let yamatoArray = [
    '',
    'body > div > h6:nth-child(2)',
    'body > div > h6:nth-child(4)',
    'body > div > h6:nth-child(6)',
    'body > div > h6:nth-child(8)',
    'body > div > h6:nth-child(10)'
  ]

  try {
    await page.goto(paramUrl, { waitUntil: 'networkidle2', timout: 0 })

    /*
     * general checking if menu is up-to-date
     * @selectTheWhole: selector for the whole text
     * todo: move outside as separate module
     */
    let found
    async function checkDateForWeekly(selectTheWhole) {
      try {
        found = false
        const theWhole = await page.evaluate(el => el.textContent, selectTheWhole)
        let actualDateStrings = theWhole.match(
          /([12]\d{3}.(0[1-9]|1[0-2]).(0[1-9]|[12]\d|3[01]))|([12]\d{3}. (0[1-9]|1[0-2]). (0[1-9]|[12]\d|3[01]))/gm
        )
        for (let i = 0; i < actualDateStrings.length; i++) {
          actualDateStrings[i] = moment(actualDateStrings[i], 'YYYY-MM-DD')
            .locale('hu')
            .format('L')
          if (actualDateStrings[i].match(todayDotSeparated)) {
            found = true
          }
        }
      } catch (e) {
        console.error(e)
      }
      return found
    }

    await checkDateForWeekly(await page.$('body'))
    // @ YAMATO Monday-Friday
    for (let i = today; i < today + 1; i++) {
      if ((await page.$(yamatoArray[i])) !== null && found === true) {
        yamato = await page.evaluate(el => el.innerText, await page.$(yamatoArray[i]))
        yamato = yamato.replace(/(\r?\n)/gm, ', ')
      } else {
        yamato = '♪"No Milk Today"♫'
      }
      paramValueString = '• Daily menu: ' + yamato + '\n'
      console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
      console.log(paramValueString)
      // @ YAMATO object
      let yamatoObj = new RestaurantMenuOutput(paramColor, paramTitleString, paramUrl, paramIcon, paramValueString)
      finalJSON.attachments.push(yamatoObj)
    }
  } catch (e) {
    console.error(e)
  }
  await page.goto('about:blank')
  await page.close()
  await browser.disconnect()
}
module.exports.scraper = scraper
