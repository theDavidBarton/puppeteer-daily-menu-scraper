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

const date = require('./../src/date').date

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
