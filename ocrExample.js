const ocrSpaceApi = require('ocr-space-api')

const imageUrl = 'http://nokedlikifozde.hu/wp-content/uploads/172.jpg'
// https://ocr.space/ocrapi#PostParameters
async function ocrSpace() {
  try {
    let parsedResult = await ocrSpaceApi.parseImageFromUrl(imageUrl, {
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
    console.log('- Monday: ' + nokedliMondayStr.join(', ') + '\n')
    console.log('- Tuesday: ' + nokedliTuesdayStr.join(', ') + '\n')
    console.log('- Wednesday: ' + nokedliWednesdayStr.join(', ') + '\n')
    console.log('- Thursday: ' + nokedliThursdayStr.join(', ') + '\n')
    console.log('- Friday: ' + nokedliFridayStr.join(', ') + '\n')
  } catch (e) {
    console.error(e)
  }
}
ocrSpace()
