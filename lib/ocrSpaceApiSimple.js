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

const request = require('request')

let parsedResult

async function ocrSpaceApiSimple(options) {
  // (I.) promise to return the parsedResult for processing
  function ocrRequest() {
    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        try {
          if (JSON.parse(body).OCRExitCode < 3) {
            resolve(JSON.parse(body).ParsedResults[0])
          } else {
            JSON.parse(body).ErrorMessage ? reject(JSON.parse(body).ErrorMessage.map(e => e)) : reject(JSON.parse(body))
          }
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  // (II.)
  try {
    parsedResult = await ocrRequest()
  } catch (e) {
    console.error(e)
  }
  // most of the cases you will need "ParsedText" => parsedResult = parsedResult.ParsedText
  return parsedResult
}

module.exports.ocrSpaceApiSimple = ocrSpaceApiSimple
