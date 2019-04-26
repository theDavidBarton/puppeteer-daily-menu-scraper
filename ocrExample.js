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
    console.log(parsedResult.ocrParsedResult.ParsedResults[0].TextOverlay.Lines) // full list
    console.log(parsedResult.ocrParsedResult.ParsedResults[0].TextOverlay.Lines[11].Words) // gyümölcsleves

  } catch (e) {
    console.error(e)
  }
}
ocrSpace()
