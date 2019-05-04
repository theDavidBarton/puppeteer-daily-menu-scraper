const fs = require('fs')
const moment = require('moment')
const puppeteer = require('puppeteer')
const compressImages = require('compress-images')
const ocrSpaceApi = require('ocr-space-api')

// get Day of Week
const today = Number(moment().format('d'))

// remove comment '//' at the end of file for local running nokedliJs()
async function nokedliJs() {
  const browser = await puppeteer.launch({ headless: true })
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

  // @ NOKEDLI selector
  const imageNokedliSelector = '.aligncenter'

  let nokedliName = 'Nokedli menu:'
  let weeklyNokedli
  await page.goto('http://nokedlikifozde.hu/', { waitUntil: 'networkidle0' })
  // @ NOKEDLI weekly
  try {
    let imageSelector = imageNokedliSelector
    weeklyNokedli = await page.evaluate(el => el.src, await page.$(imageSelector))
    weeklyNokedli = weeklyNokedli.replace('-300x212', '')
  } catch (e) {
    console.error(e)
  }
  // @ NOKEDLI download weekly menu image
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
  compressImages(
    input,
    output,
    { compress_force: false, statistic: false, autoupdate: true },
    false,
    { jpg: { engine: 'mozjpeg', command: ['-quality', '60'] } },
    { png: { engine: 'pngquant', command: ['--quality=20-50'] } },
    { svg: { engine: 'svgo', command: '--multipass' } },
    { gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] } },
    async function(error, completed) {
      // @ NOKEDLI OCR reduced image
      const imagePath = 'tmp/output/weeklyNokedli.jpg'
      try {
        let parsedResult = await ocrSpaceApi.parseImageFromLocalFile(imagePath, {
          apikey: process.env.OCR_API_KEY, // add app.env to your environment variables, source: https://hackernoon.com/how-to-use-environment-variables-keep-your-secret-keys-safe-secure-8b1a7877d69c
          language: 'hun',
          imageFormat: 'image/png',
          scale: true,
          isOverlayRequired: true
        })

        let textOverlayLinesCount = parsedResult.ocrParsedResult.ParsedResults[0].TextOverlay.Lines.length // text group count
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
          let textOverlayWordsCount = parsedResult.ocrParsedResult.ParsedResults[0].TextOverlay.Lines[i].Words.length
          for (let j = 0; j < textOverlayWordsCount; j++) {
            let wordLeft = parsedResult.ocrParsedResult.ParsedResults[0].TextOverlay.Lines[i].Words[0].Left
            let wordTop = parsedResult.ocrParsedResult.ParsedResults[0].TextOverlay.Lines[i].Words[0].Top
            let wordText = parsedResult.ocrParsedResult.ParsedResults[0].TextOverlay.Lines[i].Words[j].WordText
            if (wordTop > 520 && wordTop < 1930) {
              monday: if (wordLeft > 780 && wordLeft < 980) {
                nokedliMonday.push(wordText)
                nokedliMondayStr = nokedliMonday.join(' ').split(/(?= [A-ZÁÍŰŐÜÖÚÓÉ])/g)
                for (let k = 0; k < nokedliMondayStr.length; k++) {
                  nokedliMondayStr[k] = nokedliMondayStr[k].trim()
                }
              }
              tuesday: if (wordLeft > 1310 && wordLeft < 1520) {
                nokedliTuesday.push(wordText)
                nokedliTuesdayStr = nokedliTuesday.join(' ').split(/(?= [A-ZÁÍŰŐÜÖÚÓÉ])/g)
                for (let k = 0; k < nokedliTuesdayStr.length; k++) {
                  nokedliTuesdayStr[k] = nokedliTuesdayStr[k].trim()
                }
              }
              wednesday: if (wordLeft > 1815 && wordLeft < 2060) {
                nokedliWednesday.push(wordText)
                nokedliWednesdayStr = nokedliWednesday.join(' ').split(/(?= [A-ZÁÍŰŐÜÖÚÓÉ])/g)
                for (let k = 0; k < nokedliWednesdayStr.length; k++) {
                  nokedliWednesdayStr[k] = nokedliWednesdayStr[k].trim()
                }
              }
              thursday: if (wordLeft > 2345 && wordLeft < 2620) {
                nokedliThursday.push(wordText)
                nokedliThursdayStr = nokedliThursday.join(' ').split(/(?= [A-ZÁÍŰŐÜÖÚÓÉ])/g)
                for (let k = 0; k < nokedliThursdayStr.length; k++) {
                  nokedliThursdayStr[k] = nokedliThursdayStr[k].trim()
                }
              }
              friday: if (wordLeft > 2880 && wordLeft < 3110) {
                nokedliFriday.push(wordText)
                nokedliFridayStr = nokedliFriday.join(' ').split(/(?= [A-ZÁÍŰŐÜÖÚÓÉ])/g)
                for (let k = 0; k < nokedliFridayStr.length; k++) {
                  nokedliFridayStr[k] = nokedliFridayStr[k].trim()
                }
              }
            }
          }
        }
        console.log('*' + nokedliName + '* \n' + '-'.repeat(nokedliName.length))
        switch (today) {
          case 1:
            console.log('• Monday: ' + nokedliMondayStr.join(', ') + '\n')
            break
          case 2:
            console.log('• Tuesday: ' + nokedliTuesdayStr.join(', ') + '\n')
            break
          case 3:
            console.log('• Wednesday: ' + nokedliWednesdayStr.join(', ') + '\n')
            break
          case 4:
            console.log('• Thursday: ' + nokedliThursdayStr.join(', ') + '\n')
            break
          case 5:
            console.log('• Friday: ' + nokedliFridayStr.join(', ') + '\n')
            break
          default:
            console.log('weekend work, eh?\n')
        }
      } catch (e) {
        console.error(e)
      }
    }
  )
  await browser.close()
}
// nokedliJs()
module.exports.nokedliJs = nokedliJs
