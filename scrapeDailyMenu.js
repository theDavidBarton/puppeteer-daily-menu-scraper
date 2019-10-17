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
const request = require('request')
const mongoDbInsertMany = require('./lib/mongoDbInsertMany')

// get Day of Week
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

console.log(
  '*' +
    dayNames[today].toUpperCase() +
    '*\n' +
    '='.repeat(dayNames[today].length)
)

// this will be the object we extend (its 'attachments') with each daily menu
let finalJSON = {
  text: '*' + dayNames[today].toUpperCase() + '* ' + todayFormatted + '\n',
  attachments: []
}

// this will be the object we store at database and we will extend with each menu
let finalMongoJSON = []

// constructor for menu object
let RestaurantMenuOutput = function(
  color,
  titleString,
  url,
  icon,
  valueString,
  priceString,
  priceCurrency,
  priceCurrencyString,
  addressString
) {
  this.fallback = 'Please open it on a device that supports formatted messages.'
  this.pretext = '...'
  this.color = color
  this.author_name = titleString.toUpperCase()
  this.author_link = url
  this.author_icon = icon
  this.fields = [
    {
      title: titleString + ' menu (' + dayNames[today] + '):',
      value: valueString,
      short: false
    },
    {
      title: 'price (' + priceCurrency + ')',
      value: priceString + priceCurrencyString,
      short: true
    },
    {
      title: 'address',
      value: addressString,
      short: true
    }
  ]
  this.footer = 'scraped by DailyMenu'
  this.ts = Math.floor(Date.now() / 1000)
}

// constructor for database object
let RestaurantMenuDb = function(
  titleString,
  priceString,
  priceCurrency,
  valueString
) {
  this.timestamp = todayDotSeparated
  this.restaurant = titleString
  this.price = priceString
  this.currency = priceCurrency
  this.menuString = valueString
}

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
    browserWSEndpoint,
    RestaurantMenuOutput,
    RestaurantMenuDb
  }

  // require scrapers after module.exports object is declared
  const mozsar = require('./scrapers/mozsar')
  const i55 = require('./scrapers/i55')
  const pestiDiszno = require('./scrapers/pestiDiszno')
  const incognito = require('./scrapers/incognito')
  const kata = require('./scrapers/kata')
  const drop = require('./scrapers/drop')
  const bodza = require('./scrapers/bodza')
  const yamato = require('./scrapers/yamato')
  const vian = require('./scrapers/vian')
  const korhely = require('./scrapers/korhely')
  const ketszerecsen = require('./scrapers/ketszerecsen')
  const fruccola = require('./scrapers/fruccola')
  const kamra = require('./scrapers/kamra')
  const roza = require('./scrapers/roza')
  const suppe = require('./scrapers/suppe')
  const karcsi = require('./scrapers/karcsi')

  // launch scrapers
  await mozsar.scraper()
  await i55.scraper()
  await pestiDiszno.scraper()
  await incognito.scraper()
  await kata.scraper()
  await drop.scraper()
  await bodza.scraper()
  await yamato.scraper()
  await vian.scraper()
  await korhely.scraper()
  await ketszerecsen.scraper()
  await fruccola.scraper()
  await kamra.scraper()
  await roza.scraper()
  await suppe.scraper()
  await karcsi.scraper()

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
