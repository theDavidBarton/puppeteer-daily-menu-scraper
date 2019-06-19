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

const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')

async function reduceImageSize(input, output) {
  try {
    await imagemin([input], output, { use: [imageminMozjpeg({ quality: 60 })] })
  } catch (e) {
    console.error(e)
  }
}

module.exports.reduceImageSize = reduceImageSize
