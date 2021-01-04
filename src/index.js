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
const fetch = require('node-fetch')
const { mongoDbInsertMany } = require('../lib/mongoDbInsertMany')
const { date } = require('./date')
const { active: activeScrapers } = require('../conf/requiredScrapers.json').scrapers

const webhookEnv = process.argv[2] === '--debug' ? process.env.WEBHOOK_URL_TEST : process.env.WEBHOOK_URL_PROD

date.bankHoliday ? process.exit(0) : console.log('not bank holiday')
console.log(`*${date.dayNames[date.today].toUpperCase()}*\n`)

// main objects
const finalJSON = {
  text: `*${date.dayNames[date.today].toUpperCase()}*\n`,
  attachments: []
}
const finalMongoJSON = []

// scraper browser instance
!(async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: null, args: ['--start-maximized'] })
  const browserWSEndpoint = browser.wsEndpoint()

  // used outside of main script in the scrapers
  module.exports = { finalJSON, finalMongoJSON, browserWSEndpoint }

  // require scrapers after module.exports object is declared and launch the active ones, see: ./conf/requiredScrapers.json
  for (const scraper of activeScrapers) {
    const actual = require(`./../scrapers/${scraper}`)
    try {
      await actual.scraper()
    } catch (e) {
      console.error(e)
    }
  }

  // the final countdown (before post the actual menu to webhooks)
  console.log('\nWARNING: the output will be posted to slack in 5 seconds!')
  setTimeout(() => console.log('POST'), 5000)

  // post final JSON to webhook
  fetch(webhookEnv, {
    method: 'post',
    body: JSON.stringify(finalJSON),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(e => console.error(e))

  // store data in MongoDB
  try {
    await mongoDbInsertMany(finalMongoJSON)
  } catch (e) {
    console.error(e)
  }
  await browser.close()
})()
