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

const request = require('request')

let parsedResult

async function ocrSpaceApiSimple(options) {
  // (I.) promise to return the parsedResult for processing
  function ocrRequest() {
    return new Promise(function(resolve, reject) {
      request(options, function(error, response, body) {
        try {
          if (JSON.parse(body).OCRExitCode < 3) {
            resolve(JSON.parse(body).ParsedResults[0])
          } else {
            reject(JSON.parse(body).ErrorMessage.map(e => e))
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
