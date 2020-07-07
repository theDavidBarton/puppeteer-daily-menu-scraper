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
   * @ INCOGNITO
   * ---------------------------------------
   * contact info:
   * Address: Budapest, Liszt tér
   * ---------------------------------------
   * description:
   * this daily menu relies on if a menu (recognizable for OCR) is available among timeline photos
   */

  // @ INCOGNITO parameters
  const color = '#cc2c2c'
  const titleString = 'Incognito'
  const url = 'https://www.facebook.com/pg/cafeincognito/posts/'
  const icon = 'https://www.nicepng.com/png/detail/141-1415218_incognito-logo-incognito-mode-icon.png'
  const addressString = 'Budapest, Liszt tér'
  const daysRegexArray = [
    null,
    /\bHÉT((.*\r?\n){3})/gi,
    /\bKED((.*\r?\n){3})/gi,
    /\bSZERD((.*\r?\n){3})/gi,
    /\bCSOT((.*\r?\n){3})|\bCSU((.*\r?\n){3})|\bCSÜ((.*\r?\n){3})|\bCsiitörtök((.*\r?\n){3})|törtök((.*\r?\n){3})/gi,
    /\bPÉNT((.*\r?\n){3})/gi
  ]
  const facebookImageUrlSelector = '.scaledImageFitHeight'
  const menuHandleRegex = /HETI MENÜ/gi
  const startLine = 1
  const endLine = 2
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
