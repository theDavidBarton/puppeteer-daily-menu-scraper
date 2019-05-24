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
    url:
      'https://scontent-vie1-1.xx.fbcdn.net/v/t1.0-0/p526x296/60641908_2277309742291711_5754122494252417024_n.jpg?_nc_cat=105&_nc_ht=scontent-vie1-1.xx&oh=bb2367bcf6c76ca142acaa49bf784f7c&oe=5D51BC3C',
    scale: 'true',
    isTable: 'true'
  }
}

// const requestPromise = util.promisify(request)

let parsedResult
request(options, function(error, response, body) {
  parsedResult = JSON.parse(response.body).ParsedResults[0].ParsedText
  console.log('#1 ' + parsedResult)
  return parsedResult
})
// console.log(typeof parsedResult)

setTimeout(function() {
  console.log('#' + 2 + ' ' + parsedResult)
}, 20000)
