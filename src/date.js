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

const moment = require('moment')
const bankHolidayChecker = require('./../lib/bankHolidayChecker').bankHolidayChecker

const date = {
  bankHoliday: bankHolidayChecker(),
  today: Number(moment().format('d')),
  todayFormatted: moment().format('LLLL'),
  todayDotSeparated: moment(moment(), 'YYYY-MM-DD').locale('hu').format('L'), // e.g. 2019.05.17. (default format for Hungarian)
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
}

/*
 * for debug purposes you can run the main script with a 2nd argument like:
 * `yarn start --debug --date=2__2019.12.24.`
 * where 2 means: Tuesday (0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday)
 * and 2019.12.14. overrides todayDotSeparated
 */

if (process.argv[3]) {
  date.today = process.argv[3].split('__')[0].match(/[0-9]/).toString()
  date.todayDotSeparated = process.argv[3].split('__')[1]
  console.log('!!! RUNNING IN DEBUG MODE !!! ', date.todayDotSeparated)
}

module.exports.date = date
