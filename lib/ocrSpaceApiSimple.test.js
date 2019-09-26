jest.setTimeout(30000)

const nock = require('nock')
const ocrSpaceApiSimple = require('./../lib/ocrSpaceApiSimple')
const ocrSpaceApiSimpleMock = require('./ocrSpaceApiSimple.mock.json')

nock('https://api.ocr.space')
  .post('/parse/image')
  .reply(200, ocrSpaceApiSimpleMock)

// a GitHub text jpg in base64 format
const imageAsBase64 =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wgARCAA+AN8DAREAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAgEAA//EABQBAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhADEAAAAUEhjCMYpjGCYRCFKYxjBKUxiAKUwgGGARQGGQAymMYwCiMYJBmMYhCgKIJhkAMxihKExTCAYYDFIYoSlIQxjDAIoBhMYgwmGEIiGGcxCAYRAjAIoBhKIBTBGU5iIYZzEIBhkAMAigGEogFKEhSCIYYDFIYZADCYxBhMYgykIYpSGKQhTGKYhjEKYxjEKU//xAAUEAEAAAAAAAAAAAAAAAAAAABw/9oACAEBAAEFAmD/xAAUEQEAAAAAAAAAAAAAAAAAAABw/9oACAEDAQE/AWD/xAAUEQEAAAAAAAAAAAAAAAAAAABw/9oACAECAQE/AWD/xAAUEAEAAAAAAAAAAAAAAAAAAABw/9oACAEBAAY/AmD/xAAaEAADAQEBAQAAAAAAAAAAAAAAARARIDEw/9oACAEBAAE/ITTZs03nTbveifDmGGRimijFHF2uH8kaMUcXht2o02MU00QxDqHyvIqrkQxTIhiqjmGReRVRVD5QxVRiji8iqiq6QxRxDFHFdiuxXDDJhlwwwy5cMMmGGGT/2gAMAwEAAgADAAAAEBIJIAAJBBAAAAABAAIBAJBIAAAAAAAABJJJBIBBIJIJBJJBBJJIJJABIJAIJBIIBIJJAAABIIJBIJBIJJAAAIIIJABJBIABABIBJAABIAABJAIBAP/EABQRAQAAAAAAAAAAAAAAAAAAAHD/2gAIAQMBAT8QYP/EABQRAQAAAAAAAAAAAAAAAAAAAHD/2gAIAQIBAT8QYP/EAB8QAQACAgEFAQAAAAAAAAAAAAEAMRARcSAhQVGBYf/aAAgBAQABPxCOlTb3Nvtm0HYMQQD0qHUEusLoWb+iDs31L3U2dC0c4EznN8XljG0S73i8sYo4odTbzLvReBtDpUOybglBqKF4QbgGXljFHFE1/YI41/YO+8beYg3ucYF/MWZbG03iXe5f5LECtYBahTeyX6aMecaeMV+xt5gLU2MPZxLMsY3948/kv8ljDc88XgbdTX9iAXFGPONPGK/Y28zzw28zzhpwI4bZ5/Jf5LGG554vLGKOKMecaeMV+xt5nnht5nnE2aiJeNvtx5y/yWMDSwUqJd7l5YxRxQiaWClRT5xX7G3mClTb3gaOcINzWc4HnCGAO+EG5r7gCIe8Ad8JvtNf2BrtEG5zgeYhga7TSaa1NfcAfuP/2Q=='

const options = {
  method: 'POST',
  url: 'https://api.ocr.space/parse/image',
  headers: {
    apikey: process.env.OCR_API_KEY || 'helloworld'
  },
  formData: {
    language: 'hun',
    isOverlayRequired: 'true',
    base64image: imageAsBase64,
    scale: 'true',
    isTable: 'true'
  }
}
const optionsError = {}
let parsedResult

describe('OCR Space Api', function() {
  test('should respond with a valid parsedResult', async function() {
    parsedResult = await ocrSpaceApiSimple.ocrSpaceApiSimple(options)
    parsedResult = parsedResult.ParsedText
    expect(parsedResult).toMatch(/GitHub/gi)
  })
  test('should throw error if promise rejects', async function() {
    parsedResult = await ocrSpaceApiSimple.ocrSpaceApiSimple(optionsError)
      .rejects
    expect(parsedResult).toBeUndefined()
  })
  test('should throw error if image is empty', async function() {
    ocrSpaceApiSimpleMock.OCRExitCode = 6
    nock('https://api.ocr.space')
      .post('/parse/image')
      .reply(200, ocrSpaceApiSimpleMock)
    parsedResult = await ocrSpaceApiSimple.ocrSpaceApiSimple(options)
    expect(parsedResult).toBeTruthy()
  })
})
