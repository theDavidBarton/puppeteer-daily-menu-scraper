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

const date = require('./../scrapeDailyMenu').date

// class for menu object
class RestaurantMenuOutput {
  constructor(color, title, url, icon, value, price, currency, priceCurrency, address) {
    this.color = color
    this.author_name = title.toUpperCase()
    this.author_link = url
    this.author_icon = icon
    this.fields = [
      {
        title: title + ' menu (' + date.dayNames[date.today] + '):',
        value: value,
        short: false
      },
      {
        title: 'price (' + currency + ')',
        value: price + priceCurrency,
        short: true
      },
      {
        title: 'address',
        value: address,
        short: true
      }
    ]
    this.footer = 'scraped by DailyMenu'
    this.ts = Math.floor(Date.now() / 1000)
  }
}

// class for database object
class RestaurantMenuDb {
  constructor(titleString, priceString, priceCurrency, valueString) {
    this.timestamp = date.todayDotSeparated
    this.restaurant = titleString
    this.price = priceString
    this.currency = priceCurrency
    this.menuString = valueString
  }
}

module.exports = { RestaurantMenuOutput, RestaurantMenuDb }
