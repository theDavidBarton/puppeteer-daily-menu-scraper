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
const moment = require('moment')
const request = require('request')
const mongoDbInsertMany = require('./lib/mongoDbInsertMany')
const bankHolidayChecker = require('./lib/bankHolidayChecker')
const activeRequiredScrapers = require('./conf/requiredScrapers.json').scrapers.active

// get Day of Week
const bankHoliday = bankHolidayChecker.bankHolidayChecker()
const now = moment()
const today = Number(moment().format('d'))
const todayFormatted = moment().format('LLLL')
const todayDotSeparated = moment(now, 'YYYY-MM-DD')
  .locale('hu')
  .format('L') // e.g. 2019.05.17. (default format for Hungarian)
const dayNames = []
for (let i = 0; i < 7; i++) {
  let day = moment(i, 'd').format('dddd')
  dayNames.push(day)
}
// check if today is a bank holiday and terminates process if it is true
bankHoliday ? process.exit(0) : console.log('not bank holiday')

console.log('*' + dayNames[today].toUpperCase() + '*\n' + '='.repeat(dayNames[today].length))

// this will be the object we extend (its 'attachments') with each daily menu
let finalJSON = {
  text: '*' + dayNames[today].toUpperCase() + '* ' + todayFormatted + '\n',
  attachments: []
}

// this will be the object we store at database and we will extend with each menu
let finalMongoJSON = []

// scraper browser instance - function that wraps all the scrapers
async function scrapeMenu() {
  const browser = await puppeteer.launch({ headless: true })
  const browserWSEndpoint = await browser.wsEndpoint()

  // used outside of main script in the scrapers
  module.exports = {
    today,
    todayDotSeparated,
    dayNames,
    finalJSON,
    finalMongoJSON,
    browserWSEndpoint
  }

  // require scrapers after module.exports object is declared and launch the active ones, see: ./conf/requiredScrapers.json
  async function scraperExecuter() {
    for (const scraper of activeRequiredScrapers) {
      const actual = require(`./scrapers/${scraper}`)
      try {
        await actual.scraper()
      } catch (e) {
        console.error(e)
      }
    }
  }
  await scraperExecuter()

  // prepare output for submit by stringifying the object
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
      url: process.env.WEBHOOK_URL_PROD,
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

  // store the data to mongoDB
  try {
    await mongoDbInsertMany.mongoDbInsertMany(finalMongoJSON)
  } catch (e) {
    console.error(e)
  }
  await browser.close()
}
scrapeMenu()
