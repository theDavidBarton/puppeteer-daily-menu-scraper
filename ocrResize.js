const fs = require('fs')
const puppeteer = require('puppeteer')
const compressImages = require('compress-images')
const ocrSpaceApi = require('ocr-space-api')

async function saveImage() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // @ NOKEDLI selector
  const imageNokedliSelector = '.aligncenter'

  let nokedliName = 'Nokedli menu:'
  let weeklyNokedli
  await page.goto('http://nokedlikifozde.hu/', { waitUntil: 'networkidle2' })
  // @ NOKEDLI weekly
  try {
    let imageSelector = imageNokedliSelector
    weeklyNokedli = await page.evaluate(el => el.src, await page.$(imageSelector))
    weeklyNokedli = weeklyNokedli.replace('-300x212', '')
    console.log('• Weekly menu: ' + weeklyNokedli + '\n')
  } catch (e) {
    console.error(e)
  }
  // @ NOKEDLI download weekly menu image
  let viewSource = await page.goto(weeklyNokedli)
  fs.writeFile('tmp/input/weeklyNokedli.jpg', await viewSource.buffer(), function(e) {
    if (e) {
      return console.log(e)
    }
    console.log('The file was saved!')
  })
  await page.waitFor(5000) // make sure download ends
  await browser.close()
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
    { gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] } }
  )

  // @ NOKEDLI OCR
  const imagePath = 'tmp/output/weeklyNokedli.jpg'
  try {
    let parsedResult = await ocrSpaceApi.parseImageFromLocalFile(imagePath, {
      apikey: process.env.OCR_API_KEY, // add app.env to your environment variables, source: https://hackernoon.com/how-to-use-environment-variables-keep-your-secret-keys-safe-secure-8b1a7877d69c
      language: 'hun',
      imageFormat: 'image/png',
      scale: true,
      isOverlayRequired: true
    })

    let textOverlayLinesCount = parsedResult.ocrParsedResult.ParsedResults[0].TextOverlay.Lines.length
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
    console.log('• Monday: ' + nokedliMondayStr.join(', ') + '\n')
    console.log('• Tuesday: ' + nokedliTuesdayStr.join(', ') + '\n')
    console.log('• Wednesday: ' + nokedliWednesdayStr.join(', ') + '\n')
    console.log('• Thursday: ' + nokedliThursdayStr.join(', ') + '\n')
    console.log('• Friday: ' + nokedliFridayStr.join(', ') + '\n')
  } catch (e) {
    console.error(e)
  }
}
saveImage()
