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
   * @ KATA
   * ---------------------------------------
   * contact info:
   * Address: Budapest, 1065, Hajós u. 27.
   * Phone: +36(1) 302 4614
   * ---------------------------------------
   * description:
   * this daily menu relies on if a menu (recognizable for OCR) is available among timeline photos
   */

  // @ KATA parameters
  let color = '#3C5A99'
  let titleString = 'Kata (Chagall)'
  let url = 'https://www.facebook.com/pg/katarestaurantbudapest/posts/'
  let icon =
    'https://lh3.googleusercontent.com/GrM72gaBN1l7BUgUuWI5T9w2zc1qxsKFNukg6Szp-lXXpfG0wmnxT2FA_o725nmAiZkxGmf_=w1080-h608-p-no-v0'
  let addressString = 'Budapest, 1065, Hajós u. 27.'
  let daysRegexArray = [
    '',
    /\bHÉT((.*\r?\n){3})/gi,
    /\bKED((.*\r?\n){3})/gi,
    /\bSZERD((.*\r?\n){3})/gi,
    /\bCS(O|Ů|U|Ü)T((.*\r?\n){3})/gi,
    /\bPÉNT((.*\r?\n){3})/gi
  ]
  let facebookImageUrlSelector = '.scaledImageFitWidth'
  let menuHandleRegex = /espresso/gi
  let startLine = 1
  let endLine = 2

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
