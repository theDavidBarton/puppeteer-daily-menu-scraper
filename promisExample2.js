const request = require('request')

async function scrapeMenu() {

  const options = {
    method: 'POST',
    url: 'https://api.ocr.space/parse/image',
    headers: {
      apikey: process.env.OCR_API_KEY
    },
    formData: {
      language: 'hun',
      isOverlayRequired: 'true',
      url:
        'https://scontent-vie1-1.xx.fbcdn.net/v/t1.0-0/p526x296/60641908_2277309742291711_5754122494252417024_n.jpg?_nc_cat=105&_nc_ht=scontent-vie1-1.xx&oh=bb2367bcf6c76ca142acaa49bf784f7c&oe=5D51BC3C',
      scale: 'true',
      isTable: 'true'
    }
  }
  let parsedResult

  function ocrRequest() {
    return new Promise(function(resolve, reject) {
      request(options, function(error, response, body) {
        try {
          resolve(JSON.parse(body).ParsedResults[0]) // .ParsedText
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  async function ocrResponse() {
    try {
      parsedResult = await ocrRequest()
    } catch (e) {
      console.error(e)
    }
  }
  await ocrResponse()
  console.log(parsedResult.ParsedText)
}
scrapeMenu()
