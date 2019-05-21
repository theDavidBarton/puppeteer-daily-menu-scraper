const request = require('request')

const options = {
  method: 'POST',
  url: 'https://api.ocr.space/parse/image',
  headers: {
    apikey: process.env.OCR_API_KEY
  },
  formData: {
    language: 'hun',
    isOverlayRequired: 'true',
    url: 'http://karcsibacsivendeglo.com/letoltes/napi_menu.pdf',
    scale: 'true',
    isTable: 'true'
  }
}

let parsedResult
request(options, function(error, response, body) {
  parsedResult = JSON.parse(response.body).ParsedResults[0].ParsedText
  console.log('#1 ' + parsedResult)
  return parsedResult
  })
