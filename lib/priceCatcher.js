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
let price

function priceCatcher(textContent) {
  price = textContent.match(/(([0-9]{1}|[0-9]{2}|[0-9]{3}|[0-9](\.| |,|)[0-9]{3})(,|))(.|..|...)(ft|huf)/i)
  if (price === null) {
    price = 'n/a'
  } else {
    price = price[0]
  }
  return price
}
module.exports.priceCatcher = priceCatcher
