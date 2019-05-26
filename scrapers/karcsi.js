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

const finalJSON = require('./../scrapeDailyMenu').finalJSON
const RestaurantMenuOutput = require('./../scrapeDailyMenu').RestaurantMenuOutput


async function scraper() {
  /*
   * @ KARCSI
   * ------------------------------------------
   * contact info:
   * Address: Budapest, Jókai u. 20, 1066
   * Phone: (1) 312 0557
   * -----------------------------------------
   */

  // @ KARCSI parameters
  let paramColor = '#ffba44'
  let paramTitleString = 'Karcsi Vendéglö'
  let paramUrl = 'http://karcsibacsivendeglo.com/letoltes/napi_menu.pdf'
  let paramIcon =
    'https://scontent.fbud1-1.fna.fbcdn.net/v/t1.0-1/c28.22.275.275a/p320x320/579633_527729393935258_751578746_n.png?_nc_cat=111&_nc_ht=scontent.fbud1-1.fna&oh=73791f008083bd39a006894bc54655d3&oe=5D61492B'
  let paramValueString
  let weeklyKarcsi
  // @ KARCSI weekly
  weeklyKarcsi = 'http://karcsibacsivendeglo.com/letoltes/napi_menu.pdf'

  paramValueString = '• Weekly menu: ' + weeklyKarcsi + '\n'
  console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
  console.log(paramValueString)
  // @ KARCSI object
  let karcsiObj = new RestaurantMenuOutput(paramColor, paramTitleString, paramUrl, paramIcon, paramValueString)
  finalJSON.attachments.push(karcsiObj)
}
module.exports.scraper = scraper
