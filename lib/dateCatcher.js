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
 * @param {boolean} interval: optional argement defaults to true
 * @param {string} textContent: selector for the whole text
 * @param {string} theWhole: textContent's string
 * @return {boolean} found
 */

let found

async function dateCatcher(textContent, interval = false) {
  try {
    found = false
    // parse date with full month names from string, used in intervals
    if (interval === true) {
      let theWhole = textContent
      const monthsWithStrings =
        '(január|február|március|április|május' +
        '|június|július|augusztus|szeptember' +
        '|október|november|december).([1-3][0-9]|[1-9])(\\.|)'
      let actualDateStrings = theWhole.match(new RegExp(monthsWithStrings, 'i'))

      // date components
      const year = moment().year()
      const month = actualDateStrings[1] // e.g. July => július
      const day = actualDateStrings[2]

      moment.locale('hu')
      let parsedDate = moment([year, 0, day]).month(month).locale('hu').format('YYYY MMMM DD')
      console.log(parsedDate)
      parsedDate = moment(parsedDate, 'YYYY MMMM DD')
        .locale('hu')
        .format('L')
      console.log(parsedDate)
      console.log(todayDotSeparated)

      dateIterator: for (let i = 0; i < 5; i++) {
        let dateIterated = moment(parsedDate).add(i, 'days').format('L')
        console.log(dateIterated)
        if (todayDotSeparated.match(dateIterated)) {
          found = true
          break dateIterator
        }
      }
    // get date from menu, used in listed menus
    } else {
      let theWhole = textContent
      let actualDateStrings = theWhole.match(
        /([12]\d{3}.(0[1-9]|1[0-2]).(0[1-9]|[12]\d|3[01]))|([12]\d{3}. (0[1-9]|1[0-2]). (0[1-9]|[12]\d|3[01]))/gm
      )
      forlabel: for (let i = 0; i < actualDateStrings.length; i++) {
        actualDateStrings[i] = moment(actualDateStrings[i], 'YYYY-MM-DD')
          .locale('hu')
          .format('L')
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
