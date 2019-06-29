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
 * @param {string} textContent: selector for the whole text
 * @param {string} theWhole: textContent's string
 * @return {boolean} found
 */

let found

async function dateCatcher(textContent, interval = false) {
  try {
    found = false
    if (interval === true) {
      let theWhole = textContent
      let actualDateStrings = theWhole.match(
        /(január|február|március|április|május|június|július|augusztus|szeptember|október|november|december).([1-3][0-9]|[1-9])(\.|)/i
      )
      console.log(actualDateStrings[0])
      actualDateStrings[0] = '2019. ' + actualDateStrings[0]
      console.log(actualDateStrings[0])
      actualDateStrings[0] = moment(actualDateStrings[0], 'YYYY MMMM DD')
        .locale('hu')
        .format('L')
      console.log(actualDateStrings[0])
      if (todayDotSeparated.match(actualDateStrings[0])) {
        found = true
      }
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
