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

const moment = require('moment')
const todayDotSeparated = require('./../src/date').date.todayDotSeparated

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
        : (theWhole = moment(theWhole.match(/[0-9]{4}\.[0-9]{2}\.[0-9]{2}\./), 'YYYY-MM-DD').format('MMMM D'))
      actualDateStrings = theWhole.match(new RegExp(monthsWithStrings, 'i'))

      // date components
      const year = moment(todayDotSeparated, 'YYYY-MM-DD').format('YYYY')
      const month = actualDateStrings[1] // e.g. July => július
      const day = actualDateStrings[2]

      let parsedDate = moment([year, 0, day]).month(month).locale('hu').format('YYYY MMMM DD')
      parsedDate = moment(parsedDate, 'YYYY MMMM DD').format('w')
      let currentWeek = moment(todayDotSeparated, 'YYYY-MM-DD').format('w')
      if (currentWeek.match(parsedDate)) {
        found = true
      }

      // get date from menu (for daily menus listed by dates)
    } else {
      let actualDateStrings = theWhole.match(/[12]\d{3}(.|\..)(0[1-9]|1[0-2])(.|\..)(0[1-9]|[12]\d|3[01])/gm)
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
