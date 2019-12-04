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
