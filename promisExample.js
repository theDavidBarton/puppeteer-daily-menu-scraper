const request = require('request')

async function all() {
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

  function parse() {
    return new Promise(function(resolve, reject) {
      request(options, function(error, response, body) {
        try {
          resolve(JSON.parse(body).ParsedResults[0].ParsedText)
        } catch (e) {
          reject(e)
        }
      })
    })
  }
  let x
  async function wrapper() {
    try {
      await parse().then(function(parsedResult) {
        // console.log(parsedResult)
        x = parsedResult
      })
    } catch (e) {
      console.error(e)
    }
  }
  await wrapper()
  console.log('ezaz? ' + x)

  /*
   * parse()
   * .then(function(parsedResult) {
   * console.log(parsedResult)
   * })
   * .catch(function(err) {
   * console.err(err)
   * })
   */
}
all()
