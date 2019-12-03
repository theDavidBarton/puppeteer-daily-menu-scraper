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

const MongoClient = require('mongodb').MongoClient

const mongoUsername = process.env.MONGO_USERNAME
const mongoPassword = process.env.MONGO_PASSWORD
const uri =
  'mongodb+srv://' +
  mongoUsername +
  ':' +
  mongoPassword +
  '@mongodailymenu001-gn6yb.gcp.mongodb.net/daily_menu?retryWrites=true&w=majority'

async function mongoDbInsertMany(contentToInsert) {
  let client
  try {
    client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    const db = client.db('daily_menu').collection('daily_menu_data')
    await db.insertMany(contentToInsert)
  } catch (e) {
    console.error(e)
  }
  client.close()
}
module.exports.mongoDbInsertMany = mongoDbInsertMany
