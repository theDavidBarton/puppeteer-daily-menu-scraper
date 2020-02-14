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

'use strict'

const puppeteer = require('puppeteer')
const request = require('request')
const mongoDbInsertMany = require('./../lib/mongoDbInsertMany').mongoDbInsertMany
const activeRequiredScrapers = require('./../conf/requiredScrapers.json').scrapers.active
const date = require('./date').date

let webhookEnv = null

process.argv[2] === '--debug'
  ? (webhookEnv = process.env.WEBHOOK_URL_TEST)
  : (webhookEnv = process.env.WEBHOOK_URL_PROD)

date.bankHoliday ? process.exit(0) : console.log('not bank holiday')
console.log('*' + date.dayNames[date.today].toUpperCase() + '*\n' + '='.repeat(date.dayNames[date.today].length))

// these will be the objects we extend (its 'attachments') with each daily menu and for MongoDB as well
let finalJSON = {
  text: '*' + date.dayNames[date.today].toUpperCase() + '* ' + date.todayFormatted + '\n',
  attachments: []
}
let finalMongoJSON = []

// scraper browser instance - function that wraps all the scrapers
async function scrapeMenu() {
  const browser = await puppeteer.launch({ headless: true })
  const browserWSEndpoint = await browser.wsEndpoint()

  // used outside of main script in the scrapers
  module.exports = { finalJSON, finalMongoJSON, browserWSEndpoint }

  // require scrapers after module.exports object is declared and launch the active ones, see: ./conf/requiredScrapers.json
  async function scraperExecuter() {
    for (const scraper of activeRequiredScrapers) {
      const actual = require(`./../scrapers/${scraper}`)
      try {
        await actual.scraper()
      } catch (e) {
        console.error(e)
      }
    }
  }
  await scraperExecuter()

  finalJSON = JSON.stringify(finalJSON)
  console.log(finalJSON)

  // the final countdown (before post the actual menu to webhooks)
  console.log('\nWARNING: the output will be posted to slack in 5 seconds!')
  setTimeout(function() {
    console.log('POST')
  }, 5000)

  // _POST the final JSON to webhook
  request(
    {
      url: webhookEnv,
      method: 'POST',
      json: false,
      body: finalJSON
    },
    function(error, response, body) {
      if (error) {
        console.error(error)
      }
    }
  )

  // store the data to MongoDB
  try {
    await mongoDbInsertMany(finalMongoJSON)
  } catch (e) {
    console.error(e)
  }
  await browser.close()
}
scrapeMenu()
