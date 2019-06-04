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
   * @ BODZA BISTRO
   * ------------------------------------------
   * contact info:
   * Address: Budapest, Bajcsy-Zsilinszky út 12, 1051
   * Phone: 06 (30) 515-52-34
   * -----------------------------------------
   */

  // @ BODZA parameters
  let paramColor = '#c7ef81'
  let paramTitleString = 'Bodza bistro'
  let paramUrl = 'http://bodzabistro.hu/heti-menu/'
  let paramIcon = 'http://bodzabistro.hu/wp-content/uploads/2016/03/nevtelen-1.png'
  let paramSelector = '.container'
  let paramValueString
  let bodzaDaily

  try {
    await page.goto(paramUrl, { waitUntil: 'domcontentloaded', timeout: 0 })
    // @ BODZA selectors
    let bodzaBlock = await page.$$(paramSelector)
    // @ BODZA Monday-Friday
    forlabelBodza: for (let i = 0; i < bodzaBlock.length; i++) {
      bodzaDaily = await page.evaluate(el => el.textContent, (await page.$$(paramSelector))[i])
      if (bodzaDaily.match(todayDotSeparated)) {
        bodzaDaily = bodzaDaily.match(/(.*)CHEF NAPI AJÁNLATA(.*\r?\n){3}/gi)
        bodzaDaily = bodzaDaily.join()
          .replace(/(\r?\n)/gm, ' ')
          .replace(/\s\s+/gm, ' ')
          .replace(/(.*)CHEF NAPI AJÁNLATA/g, '')

        break forlabelBodza
      }
      bodzaDaily = '♪"No Milk Today"♫'
    }
    paramValueString = '• Daily menu: ' + bodzaDaily + '\n'
    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString)
    // @ BODZA object
    let bodzaObj = new RestaurantMenuOutput(paramColor, paramTitleString, paramUrl, paramIcon, paramValueString)
    finalJSON.attachments.push(bodzaObj)
  } catch (e) {
    console.error(e)
  }
  await page.goto('about:blank')
  await page.close()
  await browser.disconnect()
}
module.exports.scraper = scraper
