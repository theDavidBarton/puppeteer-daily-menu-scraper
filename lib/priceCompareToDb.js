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

/*
 * @param {string} contentToFind: exact name of the restauirant
 * @param {string} currentPrice: the returned value of priceCatcher.js
 * @return {string} trend: ▲ OR ▼ OR '' (empty string)
 */

'use strict'

const MongoClient = require('mongodb').MongoClient

const mongoUsername = process.env.MONGO_USERNAME
const mongoPassword = process.env.MONGO_PASSWORD
const uri =
  'mongodb+srv://' +
  mongoUsername +
  ':' +
  mongoPassword +
  '@mongodailymenu001-gn6yb.gcp.mongodb.net/daily_menu?retryWrites=true&w=majority'

async function priceCompareToDb(contentToFind, currentPrice) {
  let client
  let res
  let prevPrice
  let trend
  try {
    client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    const db = client.db('daily_menu').collection('daily_menu_data')
    res = await db
      .find({ restaurant: contentToFind })
      .sort({ _id: -1 })
      .limit(1)
      .toArray()
    client.close()
  } catch (e) {
    console.error(e)
  }
  try {
    prevPrice = res[0].price
    prevPrice = parseInt(prevPrice, 10)
    currentPrice = parseInt(currentPrice, 10)
    if (prevPrice < currentPrice) {
      trend = '▲'
    } else if (prevPrice > currentPrice) {
      trend = '▼'
    } else {
      trend = ''
    }
  } catch (e) {
    console.error(e)
  }
  return trend
}

module.exports.priceCompareToDb = priceCompareToDb
