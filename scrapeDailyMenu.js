const puppeteer = require('puppeteer')
const moment = require('moment')
const ocrSpaceApi = require('ocr-space-api')
const fs = require('fs')
const request = require('request')
const compressImages = require('compress-images')
const nokedliJs = require('./scrapeDailyNokedli')

// get Day of Week
const today = 5 //Number(moment().format('d'))
const todayFormatted = moment().format('LLLL')
const todayMinusOne = moment(todayFormatted, 'LLLL')
  .subtract(1, 'day')
  .format('LLLL')
const dayNames = []
for (let i = 0; i < 7; i++) {
  let day = moment(i, 'd').format('dddd')
  dayNames.push(day)
}
console.log('*' + dayNames[today].toUpperCase() + '*\n' + '='.repeat(dayNames[today].length))

async function scrapeMenu() {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  // abort all images, source: https://github.com/GoogleChrome/puppeteer/blob/master/examples/block-images.js
  await page.setRequestInterception(true)
  page.on('request', request => {
    if (request.resourceType() === 'image') {
      request.abort()
    } else {
      request.continue()
    }
  })

  // replace pairs for typical OCR errors in Hungarian dish names
  let replacementMap = [
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
  let finalJSON = {
    text: '*' + dayNames[today].toUpperCase() + '* ' + todayFormatted + '\n',
    attachments: []
  }

  // function for @ {RESTAURANT}s with only facebook image menus
  async function ocrFacebookImage(
    paramColor,
    paramNameString,
    paramUrl,
    paramIcon,
    paramDaysRegexArray,
    paramFacebookImageUrlSelector,
    paramMenuHandleRegex,
    paramStartLine,
    paramEndLine
  ) {
    let restaurantName = paramNameString
    await page.goto(paramUrl, {
      waitUntil: 'domcontentloaded'
    })
    // @ {RESTAURANT} the hunt for the menu image src
    let restaurantParsedText
    let restaurantDaysRegex = paramDaysRegexArray
    let imageUrlArray = []
    let restaurantDailyArray = []
    let restaurantJSON
    let restaurantObj
    try {
      const facebookImageUrl = await page.$$(paramFacebookImageUrlSelector)
      for (let i = 0; i < facebookImageUrl.length; i++) {
        let imageUrl = await page.evaluate(el => el.src, facebookImageUrl[i])
        imageUrlArray.push(imageUrl)
      }
    } catch (e) {
      console.error(e)
    }
    // @ {RESTAURANT} OCR
    // https://ocr.space/ocrapi#PostParameters
    try {
      forlabelRestaurant: for (let i = 0; i < imageUrlArray.length; i++) {
        let parsedResult = await ocrSpaceApi.parseImageFromUrl(imageUrlArray[i], {
          apikey: process.env.OCR_API_KEY, // add app.env to your environment variables, see README.md
          imageFormat: 'image/png',
          scale: true,
          isOverlayRequired: true
        })
        restaurantParsedText = parsedResult.parsedText
        if (restaurantParsedText.match(paramMenuHandleRegex)) {
          // @ {RESTAURANT} Monday-Friday
          for (let j = today; j < today + 1; j++) {
            let restaurantDaily = restaurantParsedText.match(restaurantDaysRegex[j])
            for (let k = 0; k < replacementMap.length; k++) {
              restaurantDaily = restaurantDaily
                .toString()
                .toLowerCase()
                .replace(replacementMap[k][0], replacementMap[k][1])
            }
            restaurantDaily = restaurantDaily.split(/\r\n/)

            for (let l = paramStartLine; l < paramEndLine + 1; l++) {
              restaurantDaily[l] = restaurantDaily[l].trim()
              restaurantDailyArray.push(restaurantDaily[l])
            }
            console.log('*' + restaurantName + '* \n' + '-'.repeat(restaurantName.length))
            console.log('• ' + dayNames[today] + ': ' + restaurantDailyArray.join(', ') + '\n')
            // @ {RESTAURANT} object
            restaurantObj = {
              fallback: 'Please open it on a device that supports formatted messages.',
              pretext: '...',
              color: paramColor,
              author_name: paramNameString.toUpperCase,
              author_link: paramUrl,
              author_icon: paramIcon,
              fields: [
                {
                  title: paramNameString + ' menu (' + dayNames[today] + '):',
                  value: restaurantDailyArray.join(', '),
                  short: false
                }
              ],
              footer: 'scraped by DailyMenu',
              ts: Math.floor(Date.now() / 1000)
            }
            finalJSON.attachments.push(restaurantObj)

            break forlabelRestaurant
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  /*
  @ PESTI DISZNO
  ---------------------------------------
  contact info:
  * Budapest, Nagymező u. 19, 1063
  * Phone: +36 (1) 951 4061
  ---------------------------------------
  description:
  * this daily menu relies on if a menu (recognizable for OCR) is available among timeline photos
  */

  await ocrFacebookImage(
    '#000000',
    'Pesti Diszno',
    'https://www.facebook.com/pg/PestiDiszno/posts/',
    'http://www.pestidiszno.hu/img/pdlogob2.png',
    ['', /[^%]*/g, /[^%]*/g, /[^%]*/g, /[^%]*/g, /[^%]*/g],
    '.scaledImageFitHeight',
    /NAPI MENÜ/gi,
    3,
    17
  )

  /*
  @ INCOGNITO
  ---------------------------------------
  contact info:
  * Address: Budapest, Liszt tér
  ---------------------------------------
  description:
  * this daily menu relies on if a menu (recognizable for OCR) is available among timeline photos
  */

  await ocrFacebookImage(
    '#cc2c2c',
    'Incognito',
    'https://www.facebook.com/pg/cafeincognito/posts/',
    '',
    [
      '',
      /\bHÉT((.*\r\n){3})/gi,
      /\bKED((.*\r\n){3})/gi,
      /\bSZERD((.*\r\n){3})/gi,
      /\bCSOT((.*\r\n){3})|\bCSU((.*\r\n){3})|\bCSÜ((.*\r\n){3})|\bCsiitörtök((.*\r\n){3})|törtök((.*\r\n){3})/gi,
      /\bPÉNT((.*\r\n){3})/gi
    ],
    '.scaledImageFitWidth',
    /Heti menü/gi,
    1,
    2
  )

  /*
  @ KATA
  ---------------------------------------
  contact info:
  * Address: Budapest, 1065, Hajós u. 27.
  * Phone: +36(1) 302 4614
  ---------------------------------------
  description:
  * this daily menu relies on if a menu (recognizable for OCR) is available among timeline photos
  */

  await ocrFacebookImage(
    '#3C5A99',
    'Kata (Chagall)',
    'https://www.facebook.com/pg/katarestaurantbudapest/posts/',
    'https://scontent-vie1-1.xx.fbcdn.net/v/t1.0-1/p200x200/54435606_326369938082271_8203013160240676864_n.jpg?_nc_cat=102&_nc_ht=scontent-vie1-1.xx&oh=f5ccb50053c0d9174c10d71ab0097807&oe=5D2A4D25',
    [
      '',
      /\bHÉT((.*\r\n){3})/gi,
      /\bKED((.*\r\n){3})/gi,
      /\bSZERD((.*\r\n){3})/gi,
      /\bCSOT((.*\r\n){3})|\bCSU((.*\r\n){3})|\bCSÜ((.*\r\n){3})/gi,
      /\bPÉNT((.*\r\n){3})/gi
    ],
    '.scaledImageFitWidth',
    /espresso/gi,
    1,
    2
  )

  async function bodza() {
    /*
    @ BODZA BISTRO
    ------------------------------------------
    contact info:
    * Address: Budapest, Bajcsy-Zsilinszky út 12, 1051
    * Phone: 06 (30) 515-52-34
    -----------------------------------------
    */

    let paramColor = '#53f442'
    let paramNameString = 'Bodza bistro'
    let paramUrl = 'http://bodzabistro.hu/heti-menu/'
    let paramIcon = 'http://bodzabistro.hu/wp-content/uploads/2016/03/nevtelen-1.png'
    let paramDaysRegexArray = ['', /Hétfő/g, /Kedd/g, /Szerda/g, /Csütörtök/g, /Péntek/g]
    let paramSelector = '.container'

    try {
      await page.goto(paramUrl, { waitUntil: 'domcontentloaded', timeout: 0 })
      // @ BODZA selectors
      let bodzaBlock = await page.$$(paramSelector)

      let bodzaDaily
      // @ BODZA Monday-Friday
      forlabelBodza: for (let i = 0; i < bodzaBlock.length; i++) {
        let bodzaItemContent = await page.evaluate(el => el.textContent, (await page.$$(paramSelector))[i])
        if (bodzaItemContent.match(paramDaysRegexArray[today])) {
          bodzaDaily = bodzaItemContent
          bodzaDaily = bodzaDaily
            .replace(/(\n)/gm, ' ')
            .replace(/\s\s+/gm, ' ')
            .replace(/(.*)CHEF NAPI AJÁNLATA/g, '')
            .replace(/LEVESEK/g, '\n• Soups: ')
            .replace(/KÖRETEK, FELTÉTEK/g, '\n• Side dishes & toppings: ')
            .replace(/LÁTVÁNYKONYHÁNK AJÁNLATA/g, '\n• Other than that: ')
            .replace(/SALÁTABÁR/g, '\n• Salads: ')
            .replace(/DESSZERTEK/g, '\n• Desserts: ')
          break forlabelBodza
        }
        bodzaDaily = '♪"No Milk Today"♫'
      }
      console.log('*' + paramNameString + '* \n' + '-'.repeat(paramNameString.length))
      console.log('• Daily menu: ' + bodzaDaily + '\n')
      // @ BODZA object
      bodzaObj = {
        fallback: 'Please open it on a device that supports formatted messages.',
        pretext: '...',
        color: paramColor,
        author_name: paramNameString.toUpperCase,
        author_link: paramUrl,
        author_icon: paramIcon,
        fields: [
          {
            title: paramNameString + ' menu (' + dayNames[today] + '):',
            value: '• Daily menu: ' + bodzaDaily + '\n',
            short: false
          }
        ],
        footer: 'scraped by DailyMenu',
        ts: Math.floor(Date.now() / 1000)
      }
      finalJSON.attachments.push(bodzaObj)
    } catch (e) {
      console.error(e)
    }
  }
  await bodza()

  /*
  @ NOKEDLI
  ------------------------------------------
  contact info:
  * Address: Budapest, Weiner Leó u. 17, 1065
  * Phone: (20) 499 5832
  -----------------------------------------
  imageSelector --> imageNokedliSelector
  * store src
  * trim thumbnail sub for normal sized image
  * download and reduce image size
  * OCR the table, see nokedliJs for details
  */

  await nokedliJs.nokedliJs()

  async function yamato() {
    /*
  @ YAMATO
  ---------------------------------------
  contact info:
  * Address: Budapest, 1066, JÓKAI U. 30.
  * Phone: +36(70)681-75-44
  ---------------------------------------
  description:
  * yamatoArray: contains selectors for tha days of the week
  * yamato: is the text inside selector (actual menu), and also the final cleaned text to be displayed in output
  */

    let paramColor = '#cca92b'
    let paramNameString = 'Yamato'
    let paramUrl = 'https://www.wasabi.hu/napimenu.php?source=yamato&lang=hu'
    let paramIcon = 'http://yamatorestaurant.hu/wp-content/uploads/2014/12/yamato_logo_retina.png'

    // @ YAMATO selectors
    let yamatoArray = [
      '',
      'body > div > h6:nth-child(2)',
      'body > div > h6:nth-child(4)',
      'body > div > h6:nth-child(6)',
      'body > div > h6:nth-child(8)',
      'body > div > h6:nth-child(10)'
    ]

    try {
      await page.goto(paramUrl, {
        waitUntil: 'networkidle2',
        timout: 0
      })
      // @ YAMATO Monday-Friday
      for (let i = today; i < today + 1; i++) {
        let yamato
        if ((await page.$(yamatoArray[i])) !== null) {
          yamato = await page.evaluate(el => el.innerText, await page.$(yamatoArray[i]))
          yamato = yamato.replace(/(\n)/gm, ', ')
        } else {
          yamato = '♪"No Milk Today"♫'
        }
        console.log('*' + paramNameString + '* \n' + '-'.repeat(paramNameString.length))
        console.log('• ' + dayNames[today] + ': ' + yamato + '\n')
        // @ YAMATO object
        yamatoObj = {
          fallback: 'Please open it on a device that supports formatted messages.',
          pretext: '...',
          color: paramColor,
          author_name: paramNameString.toUpperCase,
          author_link: paramUrl,
          author_icon: paramIcon,
          fields: [
            {
              title: paramNameString + ' menu (' + dayNames[today] + '):',
              value: '• Daily menu: ' + yamato + '\n',
              short: false
            }
          ],
          footer: 'scraped by DailyMenu',
          ts: Math.floor(Date.now() / 1000)
        }
        finalJSON.attachments.push(yamatoObj)
      }
    } catch (e) {
      console.error(e)
    }
  }
  await yamato()

  async function vian() {
    /*
  @ VIAN
  ------------------------------------------
  contact info:
  * Address: Budapest, Liszt Ferenc tér 9, 1061
  * Phone: (1) 268 1154
  -----------------------------------------
  description:
  * vianArray[1-2]: contains selectors for tha days of the week
  * vian[1-2]: is the text inside selector (actual menu) to be displayed in output
  */

    let paramColor = '#cc2b2b'
    let paramNameString = 'Cafe Vian'
    let paramUrl = 'http://www.cafevian.com/ebedmenue'
    let paramIcon = 'https://static.wixstatic.com/media/d21995_af5b6ceedafd4913b3ed17f6377cdfa7~mv2.png'

    // @ VIAN selectors [1: first course, 2: main course]
    let vianArray1 = [
      '',
      '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(1) > div:nth-child(1) > div.heartyQ2riU',
      '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(2) > div:nth-child(1) > div.heartyQ2riU',
      '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(3) > div:nth-child(1) > div.heartyQ2riU',
      '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(4) > div:nth-child(1) > div.heartyQ2riU',
      '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(5) > div:nth-child(1) > div.heartyQ2riU'
    ]
    let vianArray2 = [
      '',
      '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(1) > div.hearty2QDOd > div > div > div.heartyQogjj > span',
      '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(2) > div.hearty2QDOd > div > div > div.heartyQogjj > span',
      '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(3) > div.hearty2QDOd > div > div > div.heartyQogjj > span',
      '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(4) > div.hearty2QDOd > div > div > div.heartyQogjj > span',
      '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(5) > div.hearty2QDOd > div > div > div.heartyQogjj > span'
    ]

    try {
      await page.goto(paramUrl, {
        waitUntil: 'networkidle2',
        timeout: 0
      })
      let linkSelectorVian = '#TPASection_jkic76naiframe'
      const linkVian = await page.evaluate(el => el.src, await page.$(linkSelectorVian))
      await page.goto(linkVian, { waitUntil: 'networkidle2', timeout: 0 })
    } catch (e) {
      console.error(e)
    }
    // @ VIAN Monday-Friday
    try {
      for (let i = today; i < today + 1; i++) {
        let vian1
        let vian2
        if ((await page.$(vianArray1[i])) !== null) {
          vian1 = await page.evaluate(el => el.innerText, await page.$(vianArray1[i]))
          vian2 = await page.evaluate(el => el.innerText, await page.$(vianArray2[i]))
        } else {
          vian1 = '♪"No Milk Today"♫'
          vian2 = ''
        }
        console.log('*' + paramNameString + '* \n' + '-'.repeat(paramNameString.length))
        console.log('• ' + dayNames[today] + ': ' + vian1 + ', ' + vian2 + '\n')
        // @ VIAN object
        vianObj = {
          fallback: 'Please open it on a device that supports formatted messages.',
          pretext: '...',
          color: paramColor,
          author_name: paramNameString.toUpperCase,
          author_link: paramUrl,
          author_icon: paramIcon,
          fields: [
            {
              title: paramNameString + ' menu (' + dayNames[today] + '):',
              value: '• Daily menu: ' + vian1 + ', ' + vian2 + '\n',
              short: false
            }
          ],
          footer: 'scraped by DailyMenu',
          ts: Math.floor(Date.now() / 1000)
        }
        finalJSON.attachments.push(vianObj)
      }
    } catch (e) {
      console.error(e)
    }
  }
  await vian()

  async function aPecsenyes() {
    /*
  @ A-PECSENYES
  ------------------------------------------
  contact info:
  * Address: 1051 Budapest, Sas utca 25.
  * Phone: 36-1-610-0645
  -----------------------------------------
  */

    let paramColor = '#a3c643'
    let paramNameString = 'A-Pecsenyés'
    let paramUrl = 'http://www.napimenu.hu/budapest/adatlap/a-pecsenyes'
    let paramIcon = 'https://apecsenyes.hu/wp-content/uploads/2018/02/a_pecsenyes_logo_intro.png'

    // @ A-PECSENYES selector
    const dailyPecsenyesSelector = '#tabsContent1 > div'

    try {
      await page.goto(paramUrl, {
        waitUntil: 'networkidle2'
      })
      // @ A-PECSENYES Daily
      let dailyPecsenyes = await page.evaluate(el => el.innerText, await page.$(dailyPecsenyesSelector))
      dailyPecsenyes = dailyPecsenyes.replace(/(\n)/gm, ', ')
      dailyPecsenyes = dailyPecsenyes.replace('Napi ebéd menü A-Pecsenyés, ', '')

      console.log('*' + paramNameString + '* \n' + '-'.repeat(paramNameString.length))
      console.log('• Daily menu: ' + dailyPecsenyes + '\n')
      // @ A-PECSENYES object
      pecsenyesObj = {
        fallback: 'Please open it on a device that supports formatted messages.',
        pretext: '...',
        color: paramColor,
        author_name: paramNameString.toUpperCase,
        author_link: paramUrl,
        author_icon: paramIcon,
        fields: [
          {
            title: paramNameString + ' menu (' + dayNames[today] + '):',
            value: '• Daily menu: ' + dailyPecsenyes + '\n',
            short: false
          }
        ],
        footer: 'scraped by DailyMenu',
        ts: Math.floor(Date.now() / 1000)
      }
      finalJSON.attachments.push(pecsenyesObj)
    } catch (e) {
      console.error(e)
    }
  }
  await aPecsenyes()

  async function korhely() {
    /*
  @ KORHELY
  ---------------------------------------------
  contact info:
  * Address: Budapest, Liszt Ferenc tér 7, 1061
  * Phone: (1) 321 0280
  ---------------------------------------------
  */

    let paramColor = '#c6b443'
    let paramNameString = 'Korhely'
    let paramUrl = 'http://www.korhelyfaloda.hu/menu'
    let paramIcon = 'https://etterem.hu/img/max960/p9787n/1393339359-3252.jpg'

    // @ KORHELY selectors
    const weeklySoupKorhelySelector = '#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(1)'
    const weeklyMainKorhelySelector = '#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(2)'
    const weeklyDessertKorhelySelector = '#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(3)'

    try {
      await page.goto(paramUrl, {
        waitUntil: 'networkidle2',
        timeout: 0
      })
      let linkSelectorKorhely = '#TPASection_ije2yufiiframe'
      const linkKorhely = await page.evaluate(el => el.src, await page.$(linkSelectorKorhely))
      await page.goto(linkKorhely, { waitUntil: 'networkidle2', timeout: 0 })
    } catch (e) {
      console.error(e)
    }
    // @ KORHELY Weekly
    try {
      let weeklySoupKorhely = await page.evaluate(el => el.innerText, await page.$(weeklySoupKorhelySelector))
      weeklySoupKorhely = weeklySoupKorhely.replace('LEVESEK', '')
      let weeklyMainKorhely = await page.evaluate(el => el.innerText, await page.$(weeklyMainKorhelySelector))
      weeklyMainKorhely = weeklyMainKorhely.replace('FŐÉTELEK', '')
      let weeklyDessertKorhely = await page.evaluate(el => el.innerText, await page.$(weeklyDessertKorhelySelector))
      weeklyDessertKorhely = weeklyDessertKorhely.replace('DESSZERTEK', '')

      console.log('*' + paramNameString + '* \n' + '-'.repeat(paramNameString.length))
      console.log(
        '• Soups: ' +
          weeklySoupKorhely +
          '\n' +
          '• Main courses: ' +
          weeklyMainKorhely +
          '\n' +
          '• Desserts: ' +
          weeklyDessertKorhely +
          '\n'
      )
      // @ KORHELY object
      korhelyObj = {
        fallback: 'Please open it on a device that supports formatted messages.',
        pretext: '...',
        color: paramColor,
        author_name: paramNameString.toUpperCase,
        author_link: paramUrl,
        author_icon: paramIcon,
        fields: [
          {
            title: paramNameString + ' menu (' + dayNames[today] + '):',
            value:
              '• Soups: ' +
              weeklySoupKorhely +
              '\n' +
              '• Main courses: ' +
              weeklyMainKorhely +
              '\n' +
              '• Desserts: ' +
              weeklyDessertKorhely +
              '\n',
            short: false
          }
        ],
        footer: 'scraped by DailyMenu',
        ts: Math.floor(Date.now() / 1000)
      }
      finalJSON.attachments.push(korhelyObj)
    } catch (e) {
      console.error(e)
    }
  }
  await korhely()
  finalJSON = JSON.stringify(finalJSON)
  console.log(finalJSON)

  /*
  @ KETSZERECSEN
  ------------------------------------------
  contact info:
  * Address: Budapest, Nagymező u. 14, 1065
  * Phone: (1) 343 1984
  -----------------------------------------
  description:
  * ketszerecsenArray[1-2]: contains selectors for tha days of the week
  * ketszerecsen[1-2]: is the text inside selector (actual menu) to be displayed in output
  */

  // @ KETSZERECSEN selectors [1: first course, 2: main course]
  let ketszerecsenArray1 = [
    '',
    'p:nth-child(4)',
    'p:nth-child(7)',
    'p:nth-child(10)',
    'p:nth-child(13)',
    'p:nth-child(16)'
  ]
  let ketszerecsenArray2 = [
    '',
    'p:nth-child(5)',
    'p:nth-child(8)',
    'p:nth-child(11)',
    'p:nth-child(14)',
    'p:nth-child(17)'
  ]

  let ketszerecsenName = 'Ketszerecsen Bisztro menu:'
  await page.goto('https://ketszerecsen.hu/#daily', {
    waitUntil: 'networkidle2'
  })
  // @ KETSZERECSEN Monday-Friday
  try {
    for (let i = today; i < today + 1; i++) {
      let ketszerecsen1
      let ketszerecsen2
      if ((await page.$(ketszerecsenArray1[i])) !== null) {
        ketszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$(ketszerecsenArray1[i]))
        ketszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$(ketszerecsenArray2[i]))
      } else {
        ketszerecsen1 = '♪"No Milk Today"♫'
        ketszerecsen2 = ''
      }
      console.log('*' + ketszerecsenName + '* \n' + '-'.repeat(ketszerecsenName.length))
      console.log('• ' + dayNames[today] + ': ' + ketszerecsen1 + ', ' + ketszerecsen2 + '\n')
    }
  } catch (e) {
    console.error(e)
  }

  /*
  @ FRUCCOLA
  ----------------------------------------------
  contact info:
  * Address: Budapest, Arany János u. 32, 1051
  * Phone: (1) 430 6125
  ----------------------------------------------
  */

  // @ FRUCCOLA selectors
  const dailyFruccolaSelector1 = '#dailymenu-holder > li.arany.today > div.soup > p.description'
  const dailyFruccolaSelector2 = '#dailymenu-holder > li.arany.today > div.main-dish > p.description'

  let fruccolaName = 'Fruccola (Arany Janos utca) menu:'
  await page.goto('http://fruccola.hu/hu', { waitUntil: 'networkidle2' })
  // @ FRUCCOLA Daily
  try {
    const dailyFruccola1 = await page.evaluate(el => el.innerText, await page.$(dailyFruccolaSelector1))
    const dailyFruccola2 = await page.evaluate(el => el.innerText, await page.$(dailyFruccolaSelector2))

    console.log('*' + fruccolaName + '* \n' + '-'.repeat(fruccolaName.length))
    console.log('• Daily menu: ' + dailyFruccola1 + ', ' + dailyFruccola2 + '\n')
  } catch (e) {
    console.error(e)
  }

  /*
  @ KAMRA
  ------------------------------------------
  contact info:
  * Address: Budapest, Hercegprímás u. 19, 1051
  * Phone: (20) 436 9968
  -----------------------------------------
  */

  // @ KAMRA selectors
  const dayKamraSelector = '.shop_today_1'
  const dailyKamraSelector = '.shop_today_title'

  let kamraName = 'Kamra menu:'
  await page.goto('http://www.kamraetelbar.hu/kamra_etelbar_mai_menu.html', {
    waitUntil: 'networkidle2'
  })
  // @ KAMRA Daily
  try {
    let dailyKamra = []
    const dayKamra = await page.evaluate(el => el.innerText, await page.$(dayKamraSelector))
    const dailyKamraSelectorLength = (await page.$$(dailyKamraSelector)).length
    for (let i = 0; i < dailyKamraSelectorLength; i++) {
      let dailyKamraItem = await page.evaluate(el => el.innerText, (await page.$$(dailyKamraSelector))[i])
      dailyKamra.push(dailyKamraItem)
    }

    console.log('*' + kamraName + '* \n' + '-'.repeat(kamraName.length))
    console.log('• ' + dayKamra + ' daily menu: ' + dailyKamra + '\n')
  } catch (e) {
    console.error(e)
  }

  /*
  @ ROZA
  ------------------------------------------
  contact info:
  * Address: Budapest, Jókai u. 22, 1066
  * Phone: (30) 611 4396
  -----------------------------------------
  */

  // @ ROZA selector
  const dailyRozaSelector = '.text_exposed_show'

  let rozaName = 'Roza menu:'
  await page.goto('https://www.facebook.com/pg/rozafinomitt/posts/?ref=page_internal', {
    waitUntil: 'networkidle2'
  })
  // @ ROZA Daily
  try {
    let dailyRoza = await page.evaluate(el => el.innerText, await page.$(dailyRozaSelector))
    dailyRoza = dailyRoza.replace(/🍲|🥪|🥧|❤️/g, '')

    console.log('*' + rozaName + '* \n' + '-'.repeat(rozaName.length))
    console.log('• Daily menu: ' + dailyRoza + '\n')
  } catch (e) {
    console.error(e)
  }

  /*
  @ SUPPÉ bistro
  ---------------------------------------
  contact info:
  * Address: Hajós u. 19 (19.45 mi), Budapest, Hungary 1065
  * Phone: (70) 336 0822
  ---------------------------------------
  Description:
  * scrape facebook posts based on xpath patterns
  * todo: avoid xpath and use selectors
  * replace redundant string patterns with regex
  */

  let suppeName = 'Suppé menu:'
  await page.goto('https://www.facebook.com/pg/bistrosuppe/posts/?ref=page_internal', {
    waitUntil: 'networkidle2'
  })
  try {
    // @ SUPPÉ selector, source: https://stackoverflow.com/questions/48448586/how-to-use-xpath-in-chrome-headlesspuppeteer-evaluate
    // @ SUPPÉ Daily
    const dailySuppeIncludes = (await page.$x('//span[contains(text(), "Sziasztok")]'))[0]
    let dailySuppe = await page.evaluate(el => el.textContent, dailySuppeIncludes)
    dailySuppe = dailySuppe.replace(/Sziasztok, |, kellemes hétvégét!|, szép napot!|, várunk Titeket!/gi, '')
    // @ SUPPÉ Weekly (on Monday)
    const weeklySuppeIncludes = (await page.$x('//p[contains(text(), "Sziasztok")]'))[0]
    let weeklySuppe = await page.evaluate(el => el.textContent, weeklySuppeIncludes)
    weeklySuppe = weeklySuppe.replace(/(?=sziasztok)(.*)(?=levesek )|(?=mai)(.*)(?=\s*)/gi, '')
    // @ SUPPÉ Monday only (on Monday)
    const mondaySuppeIncludes = (await page.$x('//p[contains(text(), "Sziasztok")]'))[0]
    let mondaySuppe = await page.evaluate(el => el.textContent, mondaySuppeIncludes)
    mondaySuppe = mondaySuppe.replace(/(?=sziasztok)(.*)(?=levesek )|(, várunk Titeket!)/gi, '')

    console.log('*' + suppeName + '* \n' + '-'.repeat(suppeName.length))
    if (today === 1) {
      console.log('• ' + dayNames[today] + ': ' + mondaySuppe + '\n')
    } else {
      console.log('• ' + dayNames[today] + ': ' + dailySuppe + '\n' + weeklySuppe + '\n')
    }
  } catch (e) {
    console.error(e)
  }

  /*
  @ KARCSI
  ------------------------------------------
  contact info:
  * Address: Budapest, Jókai u. 20, 1066
  * Phone: (1) 312 0557
  -----------------------------------------
  */

  let karcsiName = 'Karcsi menu:'

  // @ KARCSI weekly
  const weeklyKarcsi = 'http://karcsibacsivendeglo.com/letoltes/napi_menu.pdf'

  console.log('*' + karcsiName + '* \n' + '-'.repeat(karcsiName.length))
  console.log('• Weekly menu: ' + weeklyKarcsi + '\n')

  // POST the final JSON to webhook
  finalJSON = JSON.stringify(finalJSON)
  console.log(finalJSON)
  request(
    {
      url: process.env.WEBHOOK_URL_TEST,
      method: 'POST',
      json: false,
      body: finalJSON
    },
    function(error, response, body) {
      if (error) {
        console.error(error)
      }
    }
  )

  await browser.close()
}
scrapeMenu()
