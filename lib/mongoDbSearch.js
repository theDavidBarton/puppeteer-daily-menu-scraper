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
 * @param {string} date: in dash separated format like 2020-01-11
 * @returns {object}: the menu content of a specific day, either selected date (from param) or latest valid date
 */

'use strict'

const MongoClient = require('mongodb').MongoClient
const moment = require('moment')

const mongoUsername = process.env.MONGO_USERNAME
const mongoPassword = process.env.MONGO_PASSWORD
const uri =
  'mongodb+srv://' +
  mongoUsername +
  ':' +
  mongoPassword +
  '@mongodailymenu001-gn6yb.gcp.mongodb.net/daily_menu?retryWrites=true&w=majority'

async function mongoDbSearch(date) {
  let client
  let res
  const dateFormatted = moment(date, 'YYYY-MM-DD')
    .locale('hu')
    .format('L')

  try {
    client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    const db = client.db('daily_menu').collection('daily_menu_data')
    if (date) {
      res = await db.find({ timestamp: dateFormatted }).toArray()
    } else {
      let latestValidTimestamp = await db
        .aggregate([
          { $sort: { timestamp: 1, restaurant: 1 } },
          {
            $group: {
              _id: '$restaurant',
              lastTimestamp: { $last: '$timestamp' }
            }
          }
        ])
        .limit(1)
        .toArray()
      latestValidTimestamp = await latestValidTimestamp[0].lastTimestamp
      res = await db.find({ timestamp: latestValidTimestamp }).toArray()
    }

    client.close()
  } catch (e) {
    console.error(e)
  }
  return res
}

module.exports.mongoDbSearch = mongoDbSearch
