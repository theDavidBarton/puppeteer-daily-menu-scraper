const ocrSpaceApi = require('ocr-space-api')

const imageFilePath = 'https://scontent-vie1-1.xx.fbcdn.net/v/t1.0-9/57606561_339523573433574_6878472617980854272_n.jpg?_nc_cat=107&_nc_ht=scontent-vie1-1.xx&oh=6ebfbc5ad394316fdaed3c349c8d9d19&oe=5D2BD627'

ocrSpaceApi.parseImageFromUrl(imageFilePath, {
  apikey: '<your_api_key_here>', // to be added via env variable later
  language: 'hun',
  imageFormat: 'image/png',
  scale: true,
  isOverlayRequired: true
}).then(function(parsedResult) {
    console.log('parsedText: ', parsedResult.parsedText)
  }).catch(function(err) {
    console.log('ERROR:', err)
  })
