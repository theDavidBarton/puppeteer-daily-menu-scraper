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

const removalMap = require('./../conf/removalMap.json')
const replacementMap = require('./../conf/replacementMap.json')

/*
 * @param {string} stringValue - the raw string we work with, object/array will throw TypeError
 * @param {boolean} replacementNeeded - boolean if the string is coming via OCR (or has some noise) or not
 * @return {string} cleanedStringValue
 */

// todo: this is actually a sync function! please address it
async function stringValueCleaner(stringValue, replacementNeeded) {
  let cleanedStringValue
  // remove unneccesary amount of spaces and strings
  if (stringValue !== null) {
    stringValue = stringValue.toString().replace(new RegExp(removalMap.remove, 'gi'), '')
    // format text and replace faulty string parts remained after OCR
    if (replacementNeeded === true) {
      for (let rule in replacementMap.rules) {
        stringValue = await stringValue.toLowerCase().replace(new RegExp(replacementMap.rules[rule], 'gi'), rule)
      }
    }
    cleanedStringValue = stringValue.replace(/\s+/g, ' ').replace(/\s,/g, ',').trim()
  } else {
    cleanedStringValue = 'n/a'
  }
  return cleanedStringValue
}
module.exports.stringValueCleaner = stringValueCleaner
