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

const ocrFacebookImage = require('./ocrFacebookImage')
const today = require('./../src/date').date.today

async function scraper() {
  /*
   * @ DROP
   * ---------------------------------------
   * contact info:
   * Address: Budapest, 1065, Hajós u. 27.
   * Phone: +36 1 235 0468
   * ---------------------------------------
   * description:
   * this daily menu relies on if a menu (recognizable for OCR) is available among timeline photos
   */

  // @ DROP parameters
  let color = '#d3cd78'
  let titleString = 'Drop Restaurant'
  let url = 'https://www.facebook.com/pg/droprestaurant/posts/'
  let icon = 'http://droprestaurant.com/public/wp-content/uploads/2015/07/logo-header.png'
  let addressString = 'Budapest, 1065, Hajós u. 27'
  let daysRegexArray = [
    null,
    /(Január|Február|Március|Április|Május|Június|Július|Augu|Szeptember|Október|November|December)((.*\r?\n){3})/gi,
    /\bKEDD((.*\r?\n){2})/gi,
    /\bSZERD((.*\r?\n){2})/gi,
    /(\bCSÜT|\bCSIIT|\bCSUT)((.*\r?\n){2})/gi,
    /\bPÉNT((.*\r?\n){2})/gi
  ]
  let facebookImageUrlSelector = '.scaledImageFitWidth'
  let menuHandleRegex = /Szerda/gi
  let startLine
  let endLine
  // drop still has shady menu image so Monday has different pattern (see daysRegexArray)
  if (today === 1) {
    startLine = 1
    endLine = 3
  } else {
    startLine = 0
    endLine = 2
  }

  await ocrFacebookImage.ocrFacebookImage(
    color,
    titleString,
    url,
    icon,
    addressString,
    daysRegexArray,
    facebookImageUrlSelector,
    menuHandleRegex,
    startLine,
    endLine
  )
}
module.exports.scraper = scraper
