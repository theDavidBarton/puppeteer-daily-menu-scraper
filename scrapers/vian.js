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

const puppeteer = require('puppeteer')
const objectDecider = require('./../lib/objectDecider')
const priceCatcher = require('./../lib/priceCatcher')
const priceCompareToDb = require('./../lib/priceCompareToDb')
const browserWSEndpoint = require('./../src/index').browserWSEndpoint
const today = require('./../src/date').date.today
const finalJSON = require('./../src/index').finalJSON
const finalMongoJSON = require('./../src/index').finalMongoJSON
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
  let paramPriceString
  let paramPriceCurrency
  let paramPriceCurrencyString
  let paramAddressString = 'Budapest, Liszt Ferenc tér 9, 1061'
  let vian1
  let vian2
  let obj = null
  let mongoObj = null

  // @ VIAN selectors [1: first course, 2: main course]
  let vianArray1 = [
    null,
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(1) > div:nth-child(1) > div.heartyQ2riU',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(2) > div:nth-child(1) > div.heartyQ2riU',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(3) > div:nth-child(1) > div.heartyQ2riU',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(4) > div:nth-child(1) > div.heartyQ2riU',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(5) > div:nth-child(1) > div.heartyQ2riU'
  ]
  let vianArray2 = [
    null,
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
      const body = await page.evaluate(el => el.textContent, (await page.$$('#mainDiv'))[0])
      // @ VIAN price catch
      let { price, priceCurrencyStr, priceCurrency } = await priceCatcher.priceCatcher(body)
      let trend = await priceCompareToDb.priceCompareToDb(paramTitleString, price)

      paramPriceString = price
      paramPriceCurrency = priceCurrency
      paramPriceCurrencyString = priceCurrencyStr + trend

      paramValueString = '• Daily menu: ' + vian1 + ', ' + vian2
      console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
      console.log(paramValueString)
      console.log(paramPriceString + paramPriceCurrencyString + '\n')
      // @ VIAN object
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
    }
  } catch (e) {
    console.error(e)
  }
  await page.goto('about:blank')
  await page.close()
  await browser.disconnect()
}
module.exports.scraper = scraper
