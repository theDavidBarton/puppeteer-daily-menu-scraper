const ocrSpaceApi = require('ocr-space-api')

const imageUrl = 'http://nokedlikifozde.hu/wp-content/uploads/172.jpg'
console.log(process.env.OCR_API_KEY + '\n')
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
    // console.log(parsedResult.ocrParsedResult.ParsedResults[0].TextOverlay.Lines) // full list
    console.log('\n ----------------')
    console.log(parsedResult.ocrParsedResult.ParsedResults[0].TextOverlay.Lines[72].Words) // specific word (or sentence) of table with data
    console.log('\n ----------------')
    console.log(parsedResult.ocrParsedResult.ParsedResults[0].TextOverlay.Lines[72].Words[0].WordText) // specific word of table
    console.log('\n ----------------')
    // console.log(parsedResult.ocrParsedResult.ParsedResults[0].TextOverlay.Lines.length) // table's WordCount
    let textOverlayLinesCount = parsedResult.ocrParsedResult.ParsedResults[0].TextOverlay.Lines.length
    let nokedliMonday = []
    let nokedliTuesday = []
    let nokedliWednesday = []
    let nokedliThursday = []
    let nokedliFriday = []
    for (let i = 0; i < textOverlayLinesCount; i++) {
      let wordText = parsedResult.ocrParsedResult.ParsedResults[0].TextOverlay.Lines[i].Words[0].WordText
      let wordLeft = parsedResult.ocrParsedResult.ParsedResults[0].TextOverlay.Lines[i].Words[0].Left
      monday: if (wordLeft > 780 && wordLeft < 980) {
        nokedliMonday.push(wordText)
      }
      tuesday: if (wordLeft > 1310 && wordLeft < 1520) {
        nokedliTuesday.push(wordText)
      }
    }
    console.log('- Monday: ' + nokedliMonday)
    console.log('- Tuesday: ' + nokedliTuesday)
  } catch (e) {
    console.error(e)
  }
}
ocrSpace()
