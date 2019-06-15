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

const compressImages = require('compress-images')
const fs = require('fs')
const puppeteer = require('puppeteer')
const ocrSpaceApiSimple = require('./../lib/ocrSpaceApiSimple')
const replacementMap = require('./../replacementMap.json')
const browserWSEndpoint = require('./../scrapeDailyMenu').browserWSEndpoint
const today = require('./../scrapeDailyMenu').today
const finalJSON = require('./../scrapeDailyMenu').finalJSON
const finalMongoJSON = require('./../scrapeDailyMenu').finalMongoJSON
const RestaurantMenuOutput = require('./../scrapeDailyMenu').RestaurantMenuOutput
const RestaurantMenuDb = require('./../scrapeDailyMenu').RestaurantMenuDb

async function scraper() {
  const browser = await puppeteer.connect({ browserWSEndpoint })
  const page = await browser.newPage()

  // abort all images, source: https://github.com/GoogleChrome/puppeteer/blob/master/examples/block-images.js
  await page.setRequestInterception(true)
  page.on('request', request => {
    if (request.resourceType() === 'image') {
      request.abort()
    } else {
      request.continue()
    }
  })

  /*
   * @ NOKEDLI
   * ------------------------------------------
   * contact info:
   * Address: Budapest, Weiner Leó u. 17, 1065
   * Phone: (20) 499 5832
   * -----------------------------------------
   * imageSelector --> imageNokedliSelector
   * store src
   * trim thumbnail sub for normal sized image
   * download and reduce image size
   * OCR the table
   */

  // @ NOKEDLI parameters
  let paramColor = '#f9c32c'
  let paramTitleString = 'Nokedli'
  let paramUrl = 'http://nokedlikifozde.hu/'
  let paramIcon =
    'https://scontent.fbud1-1.fna.fbcdn.net/v/t1.0-1/p320x320/969066_507629642637360_22543675_n.jpg?_nc_cat=108&_nc_ht=scontent.fbud1-1.fna&oh=a2e8efd55605ba9b7b63553dc54c23ca&oe=5D6F4115'
  let paramValueString
  let paramPriceString = 'n/a'
  let weeklyNokedli
  let parsedResult

  // @ NOKEDLI selector
  const imageNokedliSelector = '.aligncenter'

  try {
    await page.goto(paramUrl, { waitUntil: 'networkidle0' })
    // @ NOKEDLI weekly
    let imageSelector = imageNokedliSelector
    weeklyNokedli = await page.evaluate(el => el.src, await page.$(imageSelector))
    weeklyNokedli = weeklyNokedli.replace('-300x212', '')
  } catch (e) {
    console.error(e)
  }
  // @ NOKEDLI download latest weekly menu image
  let weeklyNokedliUrlVisit = await page.goto(weeklyNokedli, { waitUntil: 'networkidle0' })
  fs.writeFile('tmp/input/weeklyNokedli.jpg', await weeklyNokedliUrlVisit.buffer(), function(err) {
    if (err) {
      return console.log(err)
    }
  })
  // clear output image if it already exists
  if (fs.existsSync('tmp/output/weeklyNokedli.jpg')) {
    fs.unlink('tmp/output/weeklyNokedli.jpg', function(err) {
      if (err) {
        return console.log(err)
      }
    })
  }
  // @ NOKEDLI reduce image size
  let input = 'tmp/input/weeklyNokedli.jpg'
  let output = 'tmp/output/'
  // the parameters for compress-images library
  let compressSettings = { compress_force: false, statistic: false, autoupdate: true }
  let jpg = { jpg: { engine: 'mozjpeg', command: ['-quality', '60'] } }
  let png = { png: { engine: 'pngquant', command: ['--quality=20-50'] } }
  let svg = { svg: { engine: 'svgo', command: '--multipass' } }
  let gif = { gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] } }

  compressImages(input, output, compressSettings, false, jpg, png, svg, gif, async function(error, completed) {
    // @ NOKEDLI OCR reduced image (plus base64 for better performance)
    const imagePath = 'tmp/output/weeklyNokedli.jpg'
    const imageAsBase64 = await fs.readFileSync(imagePath, 'base64')
    const options = {
      method: 'POST',
      url: 'https://api.ocr.space/parse/image',
      headers: {
        apikey: process.env.OCR_API_KEY
      },
      formData: {
        language: 'hun',
        isOverlayRequired: 'true',
        base64image: 'data:image/jpg;base64,' + imageAsBase64,
        scale: 'true',
        isTable: 'true'
      }
    }
    try {
      parsedResult = await ocrSpaceApiSimple.ocrSpaceApiSimple(options)

      let textOverlayLinesCount = parsedResult.TextOverlay.Lines.length // text group count
      let nokedliMonday = []
      let nokedliMondayStr = []
      let nokedliTuesday = []
      let nokedliTuesdayStr = []
      let nokedliWednesday = []
      let nokedliWednesdayStr = []
      let nokedliThursday = []
      let nokedliThursdayStr = []
      let nokedliFriday = []
      let nokedliFridayStr = []

      // checks word coordinates against a predefined map of the table
      for (let i = 0; i < textOverlayLinesCount; i++) {
        let textOverlayWordsCount = parsedResult.TextOverlay.Lines[i].Words.length
        for (let j = 0; j < textOverlayWordsCount; j++) {
          let wordLeft = parsedResult.TextOverlay.Lines[i].Words[0].Left
          let wordTop = parsedResult.TextOverlay.Lines[i].Words[0].Top
          let wordText = parsedResult.TextOverlay.Lines[i].Words[j].WordText
          // format text and replace faulty string parts
          for (let k = 0; k < replacementMap.length; k++) {
            wordText = wordText.replace(new RegExp(replacementMap[k][0], 'g'), replacementMap[k][1])
          }
          if (wordTop > 520 && wordTop < 1930) {
            monday: if (wordLeft > 780 && wordLeft < 980) {
              nokedliMonday.push(wordText)
              nokedliMondayStr = nokedliMonday.join(' ').split(/(?= [A-ZÁÍŰŐÜÖÚÓÉ])/g)
              for (let l = 0; l < nokedliMondayStr.length; l++) {
                nokedliMondayStr[l] = nokedliMondayStr[l].trim()
              }
            }
            tuesday: if (wordLeft > 1310 && wordLeft < 1546) {
              nokedliTuesday.push(wordText)
              nokedliTuesdayStr = nokedliTuesday.join(' ').split(/(?= [A-ZÁÍŰŐÜÖÚÓÉ])/g)
              for (let l = 0; l < nokedliTuesdayStr.length; l++) {
                nokedliTuesdayStr[l] = nokedliTuesdayStr[l].trim()
              }
            }
            wednesday: if (wordLeft > 1815 && wordLeft < 2090) {
              nokedliWednesday.push(wordText)
              nokedliWednesdayStr = nokedliWednesday.join(' ').split(/(?= [A-ZÁÍŰŐÜÖÚÓÉ])/g)
              for (let l = 0; l < nokedliWednesdayStr.length; l++) {
                nokedliWednesdayStr[l] = nokedliWednesdayStr[l].trim()
              }
            }
            thursday: if (wordLeft > 2345 && wordLeft < 2620) {
              nokedliThursday.push(wordText)
              nokedliThursdayStr = nokedliThursday.join(' ').split(/(?= [A-ZÁÍŰŐÜÖÚÓÉ])/g)
              for (let l = 0; l < nokedliThursdayStr.length; l++) {
                nokedliThursdayStr[l] = nokedliThursdayStr[l].trim()
              }
            }
            friday: if (wordLeft > 2880 && wordLeft < 3110) {
              nokedliFriday.push(wordText)
              nokedliFridayStr = nokedliFriday.join(' ').split(/(?= [A-ZÁÍŰŐÜÖÚÓÉ])/g)
              for (let l = 0; l < nokedliFridayStr.length; l++) {
                nokedliFridayStr[l] = nokedliFridayStr[l].trim()
              }
            }
          }
        }
      }
      console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))

      switch (today) {
        case 1:
          paramValueString = '• Daily menu: ' + nokedliMondayStr.join(', ') + '\n'
          console.log(paramValueString)
          break
        case 2:
          paramValueString = '• Daily menu: ' + nokedliTuesdayStr.join(', ') + '\n'
          console.log(paramValueString)
          break
        case 3:
          paramValueString = '• Daily menu: ' + nokedliWednesdayStr.join(', ') + '\n'
          console.log(paramValueString)
          break
        case 4:
          paramValueString = '• Daily menu: ' + nokedliThursdayStr.join(', ') + '\n'
          console.log(paramValueString)
          break
        case 5:
          paramValueString = '• Daily menu: ' + nokedliFridayStr.join(', ') + '\n'
          console.log(paramValueString)
          break
        default:
          paramValueString = 'weekend work, eh?\n'
          console.log(paramValueString)
      }
      // @ NOKEDLI object
      let nokedliObj = new RestaurantMenuOutput(
        paramColor,
        paramTitleString,
        paramUrl,
        paramIcon,
        paramValueString,
        paramPriceString
      )
      let nokedliMongoObj = new RestaurantMenuDb(paramTitleString, paramPriceString, paramValueString)
      finalJSON.attachments.push(nokedliObj)
      finalMongoJSON.push(nokedliMongoObj)
    } catch (e) {
      console.error(e)
    }
  })
  await page.goto('about:blank')
  await page.close()
  await browser.disconnect()
}
module.exports.scraper = scraper
