jest.setTimeout(30000)

const nock = require('nock')
const priceCompareToDb = require('./../lib/priceCompareToDb')

nock('https://api.ocr.space')
  .post('/parse/image')
  .reply(200, ocrSpaceApiSimpleMock)

describe('price comparer', function() {
  test('should respond with up if price increased', async function() {
    parsedResult = await priceCompareToDb.priceCompareToDb('Drop', 1400)
    parsedResult = parsedResult.ParsedText
    expect(parsedResult).toMatch(/GitHub/gi)
  })
})
