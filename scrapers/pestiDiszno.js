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

async function scraper() {
  /*
   * @ PESTI DISZNO
   * ---------------------------------------
   * contact info:
   * Budapest, Nagymező u. 19, 1063
   * Phone: +36 (1) 951 4061
   * ---------------------------------------
   * description:
   * this daily menu relies on if a menu (recognizable for OCR) is available among timeline photos
   */

  // @ PESTI DISZNO parameters
  let color = '#000000'
  let titleString = 'Pesti Diszno'
  let url = 'https://www.facebook.com/pg/PestiDiszno/posts/'
  let icon = 'http://www.pestidiszno.hu/img/pdlogob2.png'
  let addressString = 'Budapest, Nagymező u. 19, 1063'
  let daysRegexArray = [null, /[^%]*/g, /[^%]*/g, /[^%]*/g, /[^%]*/g, /[^%]*/g]
  let facebookImageUrlSelector = 'img[class^="scaledImageFit"]'
  let menuHandleRegex = /fogás/gi
  let startLine = 3
  let endLine = 17

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
