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
 * @param {string} textContent: selector for the whole text
 * @param {index} iKnowBetter: optional override index if I don't want the very first price to be displayed
 * @return {string} price: the preferred displayed price
 * @return {string} priceCurrencyStr: the currency displayed with the price in the output
 * @return {string} priceCurrency: currency for database
 */

let price
let priceCurrencyStr
let priceCurrency

function priceCatcher(textContent, iKnowBetter = 0) {
  price = 'n/a'
  priceCurrencyStr = ''
  priceCurrency = 'n/a'
  if (textContent !== undefined) {
    price = textContent.match(/(([0-9]{1}|[0-9]{2}|[0-9]{3}|[0-9](\.|\s|,|)[0-9]{3})(,|))(|.|..|...)(ft|huf)/gim)
    if (price !== null) {
      price = price[iKnowBetter]
      price = price.replace(/,[0-9][0-9][^\d]/g, '')
      price = price.replace(/[^0-9]/g, '')
      priceCurrencyStr = ' Ft'
      priceCurrency = 'HUF'
    } else {
      price = 'n/a'
      priceCurrencyStr = ''
      priceCurrency = 'n/a'
    }
  }
  return { price, priceCurrencyStr, priceCurrency }
}
module.exports.priceCatcher = priceCatcher
