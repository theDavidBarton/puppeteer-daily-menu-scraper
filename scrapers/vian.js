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
   * @ VIAN
   * ------------------------------------------
   * contact info:
   * Address: Budapest, Liszt Ferenc tér 9, 1061
   * Phone: (1) 268 1154
   * -----------------------------------------
   * description:
   * vianArray[1-2]: contains selectors for tha days of the week
   * vian[1-2]: is the text inside selector (actual menu) to be displayed in output
   */

  // @ VIAN parameters
  let paramColor = '#cc2b2b'
  let paramTitleString = 'Cafe Vian'
  let paramUrl = 'http://www.cafevian.com/ebedmenue'
  let paramIcon = 'https://static.wixstatic.com/media/d21995_af5b6ceedafd4913b3ed17f6377cdfa7~mv2.png'
  let paramValueString
  let vian1, vian2

  // @ VIAN selectors [1: first course, 2: main course]
  let vianArray1 = [
    '',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(1) > div:nth-child(1) > div.heartyQ2riU',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(2) > div:nth-child(1) > div.heartyQ2riU',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(3) > div:nth-child(1) > div.heartyQ2riU',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(4) > div:nth-child(1) > div.heartyQ2riU',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(5) > div:nth-child(1) > div.heartyQ2riU'
  ]
  let vianArray2 = [
    '',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(1) > div.hearty2QDOd > div > div > div.heartyQogjj > span',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(2) > div.hearty2QDOd > div > div > div.heartyQogjj > span',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(3) > div.hearty2QDOd > div > div > div.heartyQogjj > span',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(4) > div.hearty2QDOd > div > div > div.heartyQogjj > span',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(5) > div.hearty2QDOd > div > div > div.heartyQogjj > span'
  ]

  try {
    await page.goto(paramUrl, { waitUntil: 'domcontentloaded', timeout: 0 })
    let linkSelectorVian = '#TPASection_jkic76naiframe'
    const linkVian = await page.evaluate(el => el.src, (await page.$$(linkSelectorVian))[0])
    await page.goto(linkVian, { waitUntil: 'domcontentloaded', timeout: 0 })
  } catch (e) {
    console.error(e)
  }
  // @ VIAN Monday-Friday
  try {
    for (let i = today; i < today + 1; i++) {
      if ((await page.$(vianArray1[i])) !== null) {
        vian1 = await page.evaluate(el => el.innerText, await page.$(vianArray1[i]))
        vian2 = await page.evaluate(el => el.innerText, await page.$(vianArray2[i]))
      } else {
        vian1 = '♪"No Milk Today"♫'
        vian2 = ''
      }
      paramValueString = '• Daily menu: ' + vian1 + ', ' + vian2 + '\n'
      console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
      console.log(paramValueString)
      // @ VIAN object
      let vianObj = new RestaurantMenuOutput(paramColor, paramTitleString, paramUrl, paramIcon, paramValueString)
      let vianMongoObj = new RestaurantMenuDb(paramTitleString, paramValueString)
      finalJSON.attachments.push(vianObj)
      finalMongoJSON.restaurants.push(vianMongoObj)
    }
  } catch (e) {
    console.error(e)
  }
  await page.goto('about:blank')
  await page.close()
  await browser.disconnect()
}
module.exports.scraper = scraper
