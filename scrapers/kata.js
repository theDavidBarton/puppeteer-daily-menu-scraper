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
    null,
    /\bHÉT((.*\r?\n){4})/gi,
    /\bKED((.*\r?\n){4})/gi,
    /\bSZERD((.*\r?\n){4})/gi,
    /\bCS(O|Ů|U|Ü)T((.*\r?\n){4})/gi,
    /\bPÉNT((.*\r?\n){3})/gi
  ]
  let facebookImageUrlSelector = '.scaledImageFitWidth'
  let menuHandleRegex = /espresso/gi
  let startLine = 1
  let endLine = 3

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
