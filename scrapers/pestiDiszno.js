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
  const color = '#000000'
  const titleString = 'Pesti Diszno'
  const url = 'https://www.facebook.com/pg/PestiDiszno/posts/'
  const icon = 'http://www.pestidiszno.hu/img/pdlogob2.png'
  const addressString = 'Budapest, Nagymező u. 19, 1063'
  const daysRegexArray = [null, /[^%]*/g, /[^%]*/g, /[^%]*/g, /[^%]*/g, /[^%]*/g]
  const facebookImageUrlSelector = 'img[class^="scaledImageFit"]'
  const menuHandleRegex = /fogás/gi
  const startLine = 3
  const endLine = 17
  const zoomIn = false

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
    endLine,
    zoomIn
  )
}
module.exports.scraper = scraper
