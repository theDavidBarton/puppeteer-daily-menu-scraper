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
