jest.setTimeout(30000)

const ocrSpaceApiSimple = require('./../lib/ocrSpaceApiSimple')
const options = {
  method: 'POST',
  url: 'https://api.ocr.space/parse/image',
  headers: {
    apikey: process.env.OCR_API_KEY || OCR_API_KEY
  },
  formData: {
    language: 'hun',
    isOverlayRequired: 'true',
    url: 'https://github.githubassets.com/images/modules/open_graph/github-logo.png',
    scale: 'true',
    isTable: 'true'
  }
}

describe('OCR Space Api', function() {
  test('should respond with a valid parsedResult', async function() {
    let parsedResult = await ocrSpaceApiSimple.ocrSpaceApiSimple(options)
    parsedResult = parsedResult.ParsedText
    expect(parsedResult).toMatch(/PornHub/gi)
  })
})
