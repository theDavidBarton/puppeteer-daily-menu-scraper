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

const moment = require('moment')
const todayDotSeparated = require('./../scrapeDailyMenu').todayDotSeparated

/*
 * @param {boolean} interval: optional argument defaults to false
 * @param {string} textContent: selector for the whole text
 * @param {string} theWhole: textContent's string
 * @return {boolean} found
 */

let found
let actualDateStrings

async function dateCatcher(textContent, interval = false) {
  try {
    found = false
    let theWhole = textContent
    moment.locale('hu')

    // checks if a parsed date is the same week as the current one (for weekly menus)
    if (interval === true) {
      const monthsWithStrings =
        '(január|február|március|április|május' +
        '|június|július|augusztus|szeptember' +
        '|október|november|december).([1-3][0-9]|[1-9])(\\.|)'
      // ternary decides if date contains month names with letters or dot separated numbers, in 2nd case: it formats it to similar format as 1st
      theWhole.match(new RegExp(monthsWithStrings, 'i'))
        ? theWhole
        : (theWhole = moment(theWhole.match(/[0-9]{4}\.[0-9]{2}\.[0-9]{2}\./), 'YYYY-MM-DD').format('MMMM DD'))

      actualDateStrings = theWhole.match(new RegExp(monthsWithStrings, 'i'))

      // date components
      const year = moment().year()
      const month = actualDateStrings[1] // e.g. July => július
      const day = actualDateStrings[2]

      let parsedDate = moment([year, 0, day])
        .month(month)
        .locale('hu')
        .format('YYYY MMMM DD')
      parsedDate = moment(parsedDate, 'YYYY MMMM DD').format('w')

      let currentWeek = moment(todayDotSeparated, 'YYYY-MM-DD').format('w')
      if (currentWeek.match(parsedDate)) {
        found = true
      }

      // get date from menu (for daily menus listed by dates)
    } else {
      let actualDateStrings = theWhole.match(
        /([12]\d{3}.(0[1-9]|1[0-2]).(0[1-9]|[12]\d|3[01]))|([12]\d{3}. (0[1-9]|1[0-2]). (0[1-9]|[12]\d|3[01]))/gm
      )
      forlabel: for (let i = 0; i < actualDateStrings.length; i++) {
        actualDateStrings[i] = moment(actualDateStrings[i], 'YYYY-MM-DD').format('L')
        if (todayDotSeparated.match(actualDateStrings[i])) {
          found = true
          break forlabel
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
  return found
}
module.exports.dateCatcher = dateCatcher
