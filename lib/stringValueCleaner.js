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

const removalMap = require('./../removalMap.json')
const replacementMap = require('./../replacementMap.json')

/*
 * @param {string} stringValue - the raw string we work with, object/array will throw TypeError
 * @param {boolean} replacementNeeded - boolean if the string is coming via OCR (or has some noise) or not
 * @return {string} cleanedStringValue
 */

let cleanedStringValue

async function stringValueCleaner(stringValue, replacementNeeded) {
  // remove unneccesary amount of spaces
  if (stringValue !== null) {
    stringValue = stringValue
      .toString()
      .replace(/\s\s+/g, '')
      .replace(new RegExp(removalMap.remove, 'gi'), '')
    // format text and replace faulty string parts remianed after OCR
    if (replacementNeeded === true) {
      for (let i = 0; i < replacementMap.length; i++) {
        stringValue = await stringValue
          .toLowerCase()
          .replace(new RegExp(replacementMap[i][0], 'gi'), replacementMap[i][1])
      }
    }
    cleanedStringValue = stringValue.trim()
  } else {
    cleanedStringValue = 'n/a'
  }
  return cleanedStringValue
}
module.exports.stringValueCleaner = stringValueCleaner
