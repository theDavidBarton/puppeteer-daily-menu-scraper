const ocrSpaceApi = require('ocr-space-api')
const moment = require('moment')

const imageUrl = 'https://scontent.fbud1-1.fna.fbcdn.net/v/t1.0-0/p480x480/60282129_2314959118563301_6447557209143377920_n.png?_nc_cat=102&_nc_ht=scontent.fbud1-1.fna&oh=bbf09fddef07d64a8573b720943b8adc&oe=5D76D20F'
let replacementMap = [
  ['i..', 'l'],
  ['i.', 'l'],
  ['zóld', 'zöld'],
  ['fustblt', 'füstölt'],
  ['fostólt', 'füstölt'],
  ['gyijmolcs', 'gyümölcs'],
  ['gvümõlcs', 'gyümölcs'],
  ['c.sirkf.', 'csirke'],
  ['pbrkblt', 'pörkölt'],
  ['fóétel', 'főétel'],
  ['tóltve', 'töltve'],
  ['siilt', 'sült'],
  ['hagvm', 'hagym'],
  ['gulv', 'guly'],
  ['c,s', 'cs'],
  ['0s', 'ös'],
  ['ggv', 'ggy'],
  ['hcs', 'hús']
]

let restaurantDaysRegex = [
  '',
  /\bPÉNT((.*\r\n){15})/gi, //|([ti](.*)[éd](.*)[a])((.*\r\n){4})
  /\bPÉNT((.*\r\n){15})/gi,
  /\bPÉNT((.*\r\n){15})/gi,
  /\bPÉNT((.*\r\n){15})/gi,
  /\bPÉNT((.*\r\n){15})/gi
]
let paramMenuHandleRegex = /Szerda/gi
let paramValueString
let restaurantParsedText
// let imageUrlArray = []
let restaurantDailyArray = []

// get Day of Week
const today = Number(moment().format('d'))
// const todayFormatted = moment().format('LLLL')
// const todayMinusOne = moment(todayFormatted, 'LLLL').subtract(1, 'day').format('LLLL')
const dayNames = []
for (let i = 0; i < 7; i++) {
  let day = moment(i, 'd').format('dddd')
  dayNames.push(day)
}

let startLine
let endLine
switch (today) {
  case 1:
    startLine = 1
    endLine = 2
    break
  case 2:
    startLine = 3
    endLine = 5
    break
  case 3:
    startLine = 6
    endLine = 8
    break
  case 4:
    startLine = 9
    endLine = 11
    break
  case 5:
    startLine = 12
    endLine = 14
    break
  default:
    startLine = 1
    endLine = 14
}

// function for @ {RESTAURANT}s with only facebook image menus
async function ocrFacebookImage() {
  try {
    let parsedResult = await ocrSpaceApi.parseImageFromUrl(imageUrl, {
      apikey: process.env.OCR_API_KEY, // add app.env to your environment variables, see README.md
      imageFormat: 'image/png',
      scale: true,
      isOverlayRequired: true
    })
    restaurantParsedText = parsedResult.parsedText
    console.log(restaurantParsedText)
    if (restaurantParsedText.match(paramMenuHandleRegex)) {
      // @ {RESTAURANT} Monday-Friday
      for (let j = today; j < today + 1; j++) {
        let restaurantDaily = restaurantParsedText.match(restaurantDaysRegex[j])
        // format text and replace faulty string parts
        for (let k = 0; k < replacementMap.length; k++) {
          restaurantDaily = restaurantDaily
            .toString()
            .toLowerCase()
            .replace(replacementMap[k][0], replacementMap[k][1])
        }
        restaurantDaily = restaurantDaily.split(/\r\n/)
        console.log(restaurantDaily)
        for (let l = startLine; l < endLine + 1; l++) {
          restaurantDaily[l] = restaurantDaily[l].trim()
          restaurantDailyArray.push(restaurantDaily[l])
        }
        paramValueString = restaurantDailyArray.join(', ')
        console.log('• ' + dayNames[today] + ': ' + paramValueString + '\n')
      }
    }
  } catch (e) {
    console.error(e)
  }
}
ocrFacebookImage()
