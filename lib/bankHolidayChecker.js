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

const moment = require('moment')
const bankHolidays = require('./../conf/bankHolidays.json')

function bankHolidayChecker() {
  const today = moment().format('YYYY-MM-DD')
  const year = today.match(/[0-9]{4}/)[0]
  let found
  try {
    found = bankHolidays[year].includes(today)
    console.log("'" + today + "'")
    console.log("'" + '2019-12-24' + "'")
  } catch (e) {
    console.error(e)
  }
  console.log(found, today)
  return found
}

module.exports.bankHolidayChecker = bankHolidayChecker
