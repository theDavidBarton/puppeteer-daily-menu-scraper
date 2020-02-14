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
