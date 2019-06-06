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
const browserWSEndpoint = require('./../scrapeDailyMenu').browserWSEndpoint || require('./responseStatusCheck.test.js').browserWSEndpoint

async function responseChecker() {
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
  async function responseStatusCheck(urlTocheck) {
    const response = await page.goto(urlTocheck)
    if (response.status() === 200) {
      console.log(urlTocheck + ' is: ' + response.status())
    } else {
      console.log('error')
    }
  }
  module.exports.responseStatusCheck = responseStatusCheck
}
module.exports.responseChecker = responseChecker
