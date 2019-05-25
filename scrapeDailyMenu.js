/*
 * copyright 2019, David Barton (theDavidBarton)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const puppeteer = require('puppeteer')
const moment = require('moment')
const request = require('request')
const replacementMap = require('./replacementMap.json') // replace pairs for typical OCR errors in Hungarian dish names
// modules

// get Day of Week
const now = moment()
const today = 1 // _Number(moment().format('d'))
const todayFormatted = moment().format('LLLL')
const todayDotSeparated = moment(now, 'YYYY-MM-DD')
  .locale('hu')
  .format('L') // e.g. 2019.05.17. (default format for Hungarian)
const dayNames = []
for (let i = 0; i < 7; i++) {
  let day = moment(i, 'd').format('dddd')
  dayNames.push(day)
}
console.log('*' + dayNames[today].toUpperCase() + '*\n' + '='.repeat(dayNames[today].length))

// scraper browser instance - function that wraps all the scrapers
async function scrapeMenu() {
  const browser = await puppeteer.launch({ headless: false })
  const browserWSEndpoint = await browser.wsEndpoint()
  const page = await browser.newPage()
  // used outside of main script
  module.exports = {
    today,
    dayNames,
    browserWSEndpoint
  }

  const nokedli = require('./scrapers/nokedli')

  // abort all images, source: https://github.com/GoogleChrome/puppeteer/blob/master/examples/block-images.js
  await page.setRequestInterception(true)
  page.on('request', request => {
    if (request.resourceType() === 'image') {
      request.abort()
    } else {
      request.continue()
    }
  })

  // this will be the object we extend ('attachments') with each daily menu
  let finalJSON = {
    text: '*' + dayNames[today].toUpperCase() + '* ' + todayFormatted + '\n',
    attachments: []
  }

  // constructor for menu object
  let RestaurantMenuOutput = function(color, titleString, url, icon, valueString) {
    this.fallback = 'Please open it on a device that supports formatted messages.'
    this.pretext = '...'
    this.color = color
    this.author_name = titleString.toUpperCase()
    this.author_link = url
    this.author_icon = icon
    this.fields = [
      {
        title: titleString + ' menu (' + dayNames[today] + '):',
        value: valueString,
        short: false
      }
    ]
    this.footer = 'scraped by DailyMenu'
    this.ts = Math.floor(Date.now() / 1000)
  }

  // general checking if menu is up-to-date
  let found
  async function checkDateForWeekly(selectTheWhole) {
    try {
      found = false
      const theWhole = await page.evaluate(el => el.textContent, selectTheWhole)
      let actualDateStrings = theWhole.match(
        /([12]\d{3}.(0[1-9]|1[0-2]).(0[1-9]|[12]\d|3[01]))|([12]\d{3}. (0[1-9]|1[0-2]). (0[1-9]|[12]\d|3[01]))/gm
      )
      for (let i = 0; i < actualDateStrings.length; i++) {
        actualDateStrings[i] = moment(actualDateStrings[i], 'YYYY-MM-DD')
          .locale('hu')
          .format('L')
        if (actualDateStrings[i].match(todayDotSeparated)) {
          found = true
        }
      }
    } catch (e) {
      console.error(e)
    }
    return found
  }

  // @ {RESTAURANT}s with only facebook image menus
  async function ocrFacebookImage(
    paramColor,
    paramTitleString,
    paramUrl,
    paramIcon,
    paramDaysRegexArray,
    paramFacebookImageUrlSelector,
    paramMenuHandleRegex,
    paramStartLine,
    paramEndLine
  ) {
    let paramValueString
    let restaurantDaysRegex = paramDaysRegexArray
    let imageUrlArray = []
    let restaurantDailyArray = []
    let parsedResult
    try {
      await page.goto(paramUrl, { waitUntil: 'domcontentloaded' })
      // @ {RESTAURANT} the hunt for the menu image src
      const facebookImageUrl = await page.$$(paramFacebookImageUrlSelector)
      for (let i = 0; i < facebookImageUrl.length; i++) {
        let imageUrl = await page.evaluate(el => el.src, facebookImageUrl[i])
        imageUrlArray.push(imageUrl)
      }
    } catch (e) {
      console.error(e)
    }
    // @ {RESTAURANT} OCR https://ocr.space/ocrapi#PostParameters
    forlabelRestaurant: for (let i = 0; i < imageUrlArray.length; i++) {
      const options = {
        method: 'POST',
        url: 'https://api.ocr.space/parse/image',
        headers: {
          apikey: process.env.OCR_API_KEY
        },
        formData: {
          language: 'hun',
          isOverlayRequired: 'true',
          url: imageUrlArray[i],
          scale: 'true',
          isTable: 'true'
        }
      }
      // (I.) promise to return the parsedResult for processing
      function ocrRequest() {
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
      // (II.)
      async function ocrResponse() {
        try {
          parsedResult = await ocrRequest()
        } catch (e) {
          console.error(e)
        }
      }
      try {
        // (III.)
        await ocrResponse()
        if (await parsedResult.match(paramMenuHandleRegex)) {
          // @ {RESTAURANT} Monday-Friday
          for (let j = today; j < today + 1; j++) {
            let restaurantDaily = parsedResult.match(restaurantDaysRegex[j])
            // format text and replace faulty string parts
            for (let k = 0; k < replacementMap.length; k++) {
              restaurantDaily = restaurantDaily
                .toString()
                .toLowerCase()
                .replace(new RegExp(replacementMap[k][0], 'g'), replacementMap[k][1])
            }
            restaurantDaily = restaurantDaily.split(/\r?\n/)

            for (let l = paramStartLine; l < paramEndLine + 1; l++) {
              restaurantDaily[l] = restaurantDaily[l].trim()
              restaurantDailyArray.push(restaurantDaily[l])
            }
            paramValueString = restaurantDailyArray.join(', ')
            console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
            console.log('• ' + dayNames[today] + ': ' + paramValueString + '\n')
            // @ {RESTAURANT} object
            let restaurantObj = new RestaurantMenuOutput(
              paramColor,
              paramTitleString,
              paramUrl,
              paramIcon,
              paramValueString
            )
            finalJSON.attachments.push(restaurantObj)

            break forlabelRestaurant
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  await nokedli.nokedli()

  async function pestiDiszno() {
    /*
     * @ PESTI DISZNO
     * ---------------------------------------
     * contact info:
     * Budapest, Nagymező u. 19, 1063
     * Phone: +36 (1) 951 4061
     * ---------------------------------------
     * description:
     * this daily menu relies on if a menu (recognizable for OCR) is available among timeline photos
     */

    // @ PESTI DISZNO parameters
    let color = '#000000'
    let titleString = 'Pesti Diszno'
    let url = 'https://www.facebook.com/pg/PestiDiszno/posts/'
    let icon = 'http://www.pestidiszno.hu/img/pdlogob2.png'
    let daysRegexArray = ['', /[^%]*/g, /[^%]*/g, /[^%]*/g, /[^%]*/g, /[^%]*/g]
    let facebookImageUrlSelector = 'img[class^="scaledImageFit"]'
    let menuHandleRegex = /fogás/gi
    let startLine = 3
    let endLine = 17

    await ocrFacebookImage(
      color,
      titleString,
      url,
      icon,
      daysRegexArray,
      facebookImageUrlSelector,
      menuHandleRegex,
      startLine,
      endLine
    )
  }
  await pestiDiszno()

  async function incognito() {
    /*
     * @ INCOGNITO
     * ---------------------------------------
     * contact info:
     * Address: Budapest, Liszt tér
     * ---------------------------------------
     * description:
     * this daily menu relies on if a menu (recognizable for OCR) is available among timeline photos
     */

    // @ INCOGNITO parameters
    let color = '#cc2c2c'
    let titleString = 'Incognito'
    let url = 'https://www.facebook.com/pg/cafeincognito/posts/'
    let icon = 'https://www.copper-state.com/wp-content/uploads/2016/02/google_incognito_mode_400.jpg'
    let daysRegexArray = [
      '',
      /\bHÉT((.*\r?\n){3})/gi,
      /\bKED((.*\r?\n){3})/gi,
      /\bSZERD((.*\r?\n){3})/gi,
      /\bCSOT((.*\r?\n){3})|\bCSU((.*\r?\n){3})|\bCSÜ((.*\r?\n){3})|\bCsiitörtök((.*\r?\n){3})|törtök((.*\r?\n){3})/gi,
      /\bPÉNT((.*\r?\n){3})/gi
    ]
    let facebookImageUrlSelector = '.scaledImageFitWidth'
    let menuHandleRegex = /Heti menü/gi
    let startLine = 1
    let endLine = 2

    await ocrFacebookImage(
      color,
      titleString,
      url,
      icon,
      daysRegexArray,
      facebookImageUrlSelector,
      menuHandleRegex,
      startLine,
      endLine
    )
  }
  await incognito()

  async function kata() {
    /*
     * @ KATA
     * ---------------------------------------
     * contact info:
     * Address: Budapest, 1065, Hajós u. 27.
     * Phone: +36(1) 302 4614
     * ---------------------------------------
     * description:
     * this daily menu relies on if a menu (recognizable for OCR) is available among timeline photos
     */

    // @ KATA parameters
    let color = '#3C5A99'
    let titleString = 'Kata (Chagall)'
    let url = 'https://www.facebook.com/pg/katarestaurantbudapest/posts/'
    let icon =
      'https://scontent-vie1-1.xx.fbcdn.net/v/t1.0-1/p200x200/54435606_326369938082271_8203013160240676864_n.jpg?_nc_cat=102&_nc_ht=scontent-vie1-1.xx&oh=f5ccb50053c0d9174c10d71ab0097807&oe=5D2A4D25'
    let daysRegexArray = [
      '',
      /\bHÉT((.*\r?\n){3})/gi,
      /\bKED((.*\r?\n){3})/gi,
      /\bSZERD((.*\r?\n){3})/gi,
      /\bCSOT((.*\r?\n){3})|\bCSU((.*\r?\n){3})|\bCSÜ((.*\r?\n){3})/gi,
      /\bPÉNT((.*\r?\n){3})/gi
    ]
    let facebookImageUrlSelector = '.scaledImageFitWidth'
    let menuHandleRegex = /espresso/gi
    let startLine = 1
    let endLine = 2

    await ocrFacebookImage(
      color,
      titleString,
      url,
      icon,
      daysRegexArray,
      facebookImageUrlSelector,
      menuHandleRegex,
      startLine,
      endLine
    )
  }
  await kata()

  async function drop() {
    /*
     * @ DROP
     * ---------------------------------------
     * contact info:
     * Address: Budapest, 1065, Hajós u. 27.
     * Phone: +36 1 235 0468
     * ---------------------------------------
     * description:
     * this daily menu relies on if a menu (recognizable for OCR) is available among timeline photos
     */

    // @ DROP parameters
    let color = '#d3cd78'
    let titleString = 'Drop Restaurant'
    let url = 'https://www.facebook.com/pg/droprestaurant/posts/'
    let icon = 'http://droprestaurant.com/public/wp-content/uploads/2015/07/logo-header.png'
    let daysRegexArray = [
      '',
      /^((.*\r?\n){4})/gi,
      /\bKEDD((.*\r?\n){2})/gi,
      /\bSZERD((.*\r?\n){2})/gi,
      /\bCSÜT((.*\r?\n){2})/gi,
      /\bPÉNT((.*\r?\n){2})/gi
    ]
    let facebookImageUrlSelector = '.scaledImageFitWidth'
    let menuHandleRegex = /Szerda/gi
    // this OCR-d menu is totally unrelaible and cannot be regexed smartly, a short term solution is a switch with predefined line numbers
    let startLine = 0
    let endLine = 2

    await ocrFacebookImage(
      color,
      titleString,
      url,
      icon,
      daysRegexArray,
      facebookImageUrlSelector,
      menuHandleRegex,
      startLine,
      endLine
    )
  }
  await drop()

  async function bodza() {
    /*
     * @ BODZA BISTRO
     * ------------------------------------------
     * contact info:
     * Address: Budapest, Bajcsy-Zsilinszky út 12, 1051
     * Phone: 06 (30) 515-52-34
     * -----------------------------------------
     */

    // @ BODZA parameters
    let paramColor = '#c7ef81'
    let paramTitleString = 'Bodza bistro'
    let paramUrl = 'http://bodzabistro.hu/heti-menu/'
    let paramIcon = 'http://bodzabistro.hu/wp-content/uploads/2016/03/nevtelen-1.png'
    let paramSelector = '.container'
    let paramValueString
    let bodzaDaily

    try {
      await page.goto(paramUrl, { waitUntil: 'domcontentloaded', timeout: 0 })
      // @ BODZA selectors
      let bodzaBlock = await page.$$(paramSelector)
      // @ BODZA Monday-Friday
      forlabelBodza: for (let i = 0; i < bodzaBlock.length; i++) {
        bodzaDaily = await page.evaluate(el => el.textContent, (await page.$$(paramSelector))[i])
        if (bodzaDaily.match(todayDotSeparated)) {
          bodzaDaily = bodzaDaily
            .replace(/(\r?\n)/gm, ' ')
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
      paramValueString = '• Daily menu: ' + bodzaDaily + '\n'
      console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
      console.log(paramValueString)
      // @ BODZA object
      let bodzaObj = new RestaurantMenuOutput(paramColor, paramTitleString, paramUrl, paramIcon, paramValueString)
      finalJSON.attachments.push(bodzaObj)
    } catch (e) {
      console.error(e)
    }
  }
  await bodza()

  async function yamato() {
    /*
     * @ YAMATO
     * ---------------------------------------
     * contact info:
     * Address: Budapest, 1066, JÓKAI U. 30.
     * Phone: +36(70)681-75-44
     * ---------------------------------------
     * description:
     * yamatoArray: contains selectors for tha days of the week
     * yamato: is the text inside selector (actual menu), and also the final cleaned text to be displayed in output
     */

    // @ YAMATO parameters
    let paramColor = '#cca92b'
    let paramTitleString = 'Yamato'
    let paramUrl = 'https://www.wasabi.hu/napimenu.php?source=yamato&lang=hu'
    let paramIcon = 'http://yamatorestaurant.hu/wp-content/uploads/2014/12/yamato_logo_retina.png'
    let paramValueString
    let yamato

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
      await page.goto(paramUrl, { waitUntil: 'networkidle2', timout: 0 })
      await checkDateForWeekly(await page.$('body'))
      // @ YAMATO Monday-Friday
      for (let i = today; i < today + 1; i++) {
        if ((await page.$(yamatoArray[i])) !== null && found === true) {
          yamato = await page.evaluate(el => el.innerText, await page.$(yamatoArray[i]))
          yamato = yamato.replace(/(\r?\n)/gm, ', ')
        } else {
          yamato = '♪"No Milk Today"♫'
        }
        paramValueString = '• Daily menu: ' + yamato + '\n'
        console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
        console.log(paramValueString)
        // @ YAMATO object
        let yamatoObj = new RestaurantMenuOutput(paramColor, paramTitleString, paramUrl, paramIcon, paramValueString)
        finalJSON.attachments.push(yamatoObj)
      }
    } catch (e) {
      console.error(e)
    }
  }
  await yamato()

  async function vian() {
    /*
     * @ VIAN
     * ------------------------------------------
     * contact info:
     * Address: Budapest, Liszt Ferenc tér 9, 1061
     * Phone: (1) 268 1154
     * -----------------------------------------
     * description:
     * vianArray[1-2]: contains selectors for tha days of the week
     * vian[1-2]: is the text inside selector (actual menu) to be displayed in output
     */

    // @ VIAN parameters
    let paramColor = '#cc2b2b'
    let paramTitleString = 'Cafe Vian'
    let paramUrl = 'http://www.cafevian.com/ebedmenue'
    let paramIcon = 'https://static.wixstatic.com/media/d21995_af5b6ceedafd4913b3ed17f6377cdfa7~mv2.png'
    let paramValueString
    let vian1, vian2

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
      await page.goto(paramUrl, { waitUntil: 'domcontentloaded', timeout: 0 })
      let linkSelectorVian = '#TPASection_jkic76naiframe'
      const linkVian = await page.evaluate(el => el.src, (await page.$$(linkSelectorVian))[0])
      await page.goto(linkVian, { waitUntil: 'domcontentloaded', timeout: 0 })
    } catch (e) {
      console.error(e)
    }
    // @ VIAN Monday-Friday
    try {
      for (let i = today; i < today + 1; i++) {
        if ((await page.$(vianArray1[i])) !== null) {
          vian1 = await page.evaluate(el => el.innerText, await page.$(vianArray1[i]))
          vian2 = await page.evaluate(el => el.innerText, await page.$(vianArray2[i]))
        } else {
          vian1 = '♪"No Milk Today"♫'
          vian2 = ''
        }
        paramValueString = '• Daily menu: ' + vian1 + ', ' + vian2 + '\n'
        console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
        console.log(paramValueString)
        // @ VIAN object
        let vianObj = new RestaurantMenuOutput(paramColor, paramTitleString, paramUrl, paramIcon, paramValueString)
        finalJSON.attachments.push(vianObj)
      }
    } catch (e) {
      console.error(e)
    }
  }
  await vian()

  async function korhely() {
    /*
     * @ KORHELY
     * ---------------------------------------------
     * contact info:
     * Address: Budapest, Liszt Ferenc tér 7, 1061
     * Phone: (1) 321 0280
     * ---------------------------------------------
     */

    // @ KORHELY parameters
    let paramColor = '#c6b443'
    let paramTitleString = 'Korhely'
    let paramUrl = 'http://www.korhelyfaloda.hu/menu'
    let paramIcon = 'https://etterem.hu/img/max960/p9787n/1393339359-3252.jpg'
    let paramValueString
    let weeklySoupKorhely, weeklyMainKorhely, weeklyDessertKorhely

    // @ KORHELY selectors
    const weeklySoupKorhelySelector = '#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(1)'
    const weeklyMainKorhelySelector = '#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(2)'
    const weeklyDessertKorhelySelector = '#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(3)'

    try {
      await page.goto(paramUrl, { waitUntil: 'networkidle2', timeout: 0 })
      let linkSelectorKorhely = '#TPASection_ije2yufiiframe'
      const linkKorhely = await page.evaluate(el => el.src, await page.$(linkSelectorKorhely))
      await page.goto(linkKorhely, { waitUntil: 'networkidle2', timeout: 0 })
    } catch (e) {
      console.error(e)
    }
    // @ KORHELY Weekly
    try {
      weeklySoupKorhely = await page.evaluate(el => el.innerText, await page.$(weeklySoupKorhelySelector))
      weeklySoupKorhely = weeklySoupKorhely.replace('LEVESEK', '')
      weeklyMainKorhely = await page.evaluate(el => el.innerText, await page.$(weeklyMainKorhelySelector))
      weeklyMainKorhely = weeklyMainKorhely.replace('FŐÉTELEK', '')
      weeklyDessertKorhely = await page.evaluate(el => el.innerText, await page.$(weeklyDessertKorhelySelector))
      weeklyDessertKorhely = weeklyDessertKorhely.replace('DESSZERTEK', '')

      paramValueString =
        '• Soups: ' +
        weeklySoupKorhely +
        '\n' +
        '• Main courses: ' +
        weeklyMainKorhely +
        '\n' +
        '• Desserts: ' +
        weeklyDessertKorhely +
        '\n'
      console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
      console.log(paramValueString)
      // @ KORHELY object
      let korhelyObj = new RestaurantMenuOutput(paramColor, paramTitleString, paramUrl, paramIcon, paramValueString)
      finalJSON.attachments.push(korhelyObj)
    } catch (e) {
      console.error(e)
    }
  }
  await korhely()

  async function ketszerecsen() {
    /*
     * @ KETSZERECSEN
     * ------------------------------------------
     * contact info:
     * Address: Budapest, Nagymező u. 14, 1065
     * Phone: (1) 343 1984
     * -----------------------------------------
     * description:
     * ketszerecsenArray[1-2]: contains selectors for tha days of the week
     * ketszerecsen[1-2]: is the text inside selector (actual menu) to be displayed in output
     */

    // @ KETSZERECSEN parameters
    let paramColor = '#000000'
    let paramTitleString = 'Két Szerecsen Bisztro'
    let paramUrl = 'https://ketszerecsen.hu/#daily'
    let paramIcon =
      'https://images.deliveryhero.io/image/netpincer/caterer/sh-9a3e84d0-2e42-11e2-9d48-7a92eabdcf20/logo.png'
    let paramValueString
    let ketszerecsen1, ketszerecsen2

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

    try {
      await page.goto(paramUrl, { waitUntil: 'networkidle2' })
      // @ KETSZERECSEN Monday-Friday
      for (let i = today; i < today + 1; i++) {
        if ((await page.$(ketszerecsenArray1[i])) !== null) {
          ketszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$(ketszerecsenArray1[i]))
          ketszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$(ketszerecsenArray2[i]))
        } else {
          ketszerecsen1 = '♪"No Milk Today"♫'
          ketszerecsen2 = ''
        }
        paramValueString = '• Daily menu: ' + ketszerecsen1 + ', ' + ketszerecsen2 + '\n'
        console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
        console.log(paramValueString)
        // @ KETSZERECSEN object
        let ketszerecsenObj = new RestaurantMenuOutput(
          paramColor,
          paramTitleString,
          paramUrl,
          paramIcon,
          paramValueString
        )
        finalJSON.attachments.push(ketszerecsenObj)
      }
    } catch (e) {
      console.error(e)
    }
  }
  await ketszerecsen()

  async function fruccola() {
    /*
     * @ FRUCCOLA
     * ----------------------------------------------
     * contact info:
     * Address: Budapest, Arany János u. 32, 1051
     * Phone: (1) 430 6125
     * ----------------------------------------------
     */

    // @ FRUCCOLA parameters
    let paramColor = '#40ae49'
    let paramTitleString = 'Fruccola (Arany Janos utca)'
    let paramUrl = 'http://fruccola.hu/hu'
    let paramIcon = 'https://pbs.twimg.com/profile_images/295153467/fruccola_logo_rgb.png'
    let paramValueString
    let dailyFruccola1, dailyFruccola2

    // @ FRUCCOLA selectors
    const dailyFruccolaSelector1 = '#dailymenu-holder > li.arany.today > div.soup > p.description'
    const dailyFruccolaSelector2 = '#dailymenu-holder > li.arany.today > div.main-dish > p.description'

    try {
      await page.goto(paramUrl, { waitUntil: 'networkidle2' })
      // @ FRUCCOLA Daily
      dailyFruccola1 = await page.evaluate(el => el.innerText, await page.$(dailyFruccolaSelector1))
      dailyFruccola2 = await page.evaluate(el => el.innerText, await page.$(dailyFruccolaSelector2))

      paramValueString = '• Daily menu: ' + dailyFruccola1 + ', ' + dailyFruccola2 + '\n'
      console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
      console.log(paramValueString)
      // @ FRUCCOLA object
      let fruccolaObj = new RestaurantMenuOutput(paramColor, paramTitleString, paramUrl, paramIcon, paramValueString)
      finalJSON.attachments.push(fruccolaObj)
    } catch (e) {
      console.error(e)
    }
  }
  await fruccola()

  async function kamra() {
    /*
     * @ KAMRA
     * ------------------------------------------
     * contact info:
     * Address: Budapest, Hercegprímás u. 19, 1051
     * Phone: (20) 436 9968
     * -----------------------------------------
     */

    // @ KAMRA parameters
    let paramColor = '#fc594e'
    let paramTitleString = 'Kamra Ételbár'
    let paramUrl = 'http://www.kamraetelbar.hu/kamra_etelbar_mai_menu.html'
    let paramIcon = 'https://media-cdn.tripadvisor.com/media/photo-s/06/f5/9b/24/getlstd-property-photo.jpg'
    let paramValueString
    let dailyKamra = []

    // @ KAMRA selectors
    const dayKamraSelector = '.shop_today_1'
    const dailyKamraSelector = '.shop_today_title'

    try {
      await page.goto(paramUrl, { waitUntil: 'networkidle2' })
      // @ KAMRA Daily
      const dayKamra = await page.evaluate(el => el.innerText, await page.$(dayKamraSelector))
      const dailyKamraSelectorLength = (await page.$$(dailyKamraSelector)).length
      for (let i = 0; i < dailyKamraSelectorLength; i++) {
        let dailyKamraItem = await page.evaluate(el => el.innerText, (await page.$$(dailyKamraSelector))[i])
        dailyKamra.push(dailyKamraItem)
      }

      paramValueString = '• ' + dayKamra + ' daily menu: ' + dailyKamra + '\n'
      console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
      console.log(paramValueString)
      // @ KAMRA object
      let kamraObj = new RestaurantMenuOutput(paramColor, paramTitleString, paramUrl, paramIcon, paramValueString)
      finalJSON.attachments.push(kamraObj)
    } catch (e) {
      console.error(e)
    }
  }
  await kamra()

  async function roza() {
    /*
     * @ ROZA
     * ------------------------------------------
     * contact info:
     * Address: Budapest, Jókai u. 22, 1066
     * Phone: (30) 611 4396
     * -----------------------------------------
     */

    // @ ROZA parameters
    let paramColor = '#fced4e'
    let paramTitleString = 'Róza Soup Restaurant'
    let paramUrl = 'https://www.facebook.com/pg/rozafinomitt/posts/'
    let paramIcon =
      'https://scontent.fbud1-1.fna.fbcdn.net/v/t1.0-1/10394619_390942531075147_2725477335166513345_n.jpg?_nc_cat=108&_nc_ht=scontent.fbud1-1.fna&oh=e1e55fe2b089e8334deaef4895579833&oe=5D77E7B6'
    let paramValueString
    let dailyRoza

    // @ ROZA selector
    const dailyRozaSelector = '.text_exposed_show'

    try {
      await page.goto(paramUrl, { waitUntil: 'networkidle2' })
      // @ ROZA Daily
      dailyRoza = await page.evaluate(el => el.innerText, await page.$(dailyRozaSelector))
      dailyRoza = dailyRoza.replace(/🍲|🥪|🥧|❤️/g, '')

      paramValueString = '• Daily menu: ' + dailyRoza + '\n'
      console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
      console.log(paramValueString)
      // @ ROZA object
      let rozaObj = new RestaurantMenuOutput(paramColor, paramTitleString, paramUrl, paramIcon, paramValueString)
      finalJSON.attachments.push(rozaObj)
    } catch (e) {
      console.error(e)
    }
  }
  await roza()

  async function suppe() {
    /*
     * @ SUPPÉ bistro
     * ---------------------------------------
     * contact info:
     * Address: Hajós u. 19 (19.45 mi), Budapest, Hungary 1065
     * Phone: (70) 336 0822
     * ---------------------------------------
     * Description:
     * scrape facebook posts based on xpath patterns
     * todo: avoid xpath and use selectors
     * replace redundant string patterns with regex
     */

    // @ SUPPÉ parameters
    let paramColor = '#b5dd8d'
    let paramTitleString = 'Bistro Suppé'
    let paramUrl = 'https://www.facebook.com/pg/bistrosuppe/posts/'
    let paramIcon =
      'https://scontent.fbud1-1.fna.fbcdn.net/v/t1.0-1/c36.0.320.320a/p320x320/1377248_364465010354681_215635093_n.jpg?_nc_cat=101&_nc_ht=scontent.fbud1-1.fna&oh=2e5b2ffdede3a0606b410ca121409f27&oe=5D5F0B90'
    let paramValueString
    let mondaySuppe, dailySuppe, weeklySuppe

    try {
      await page.goto(paramUrl, { waitUntil: 'networkidle2' })
      /*
       * @ SUPPÉ selector, source: https://stackoverflow.com/questions/48448586/how-to-use-xpath-in-chrome-headlesspuppeteer-evaluate
       * @ SUPPÉ Daily
       */
      const dailySuppeIncludes = (await page.$x('//span[contains(text(), "Sziasztok")]'))[0]
      dailySuppe = await page.evaluate(el => el.textContent, dailySuppeIncludes)
      dailySuppe = dailySuppe.replace(/Sziasztok, |, kellemes hétvégét!|, szép napot!|, várunk Titeket!/gi, '')
      // @ SUPPÉ Weekly (on Monday)
      const weeklySuppeIncludes = (await page.$x('//p[contains(text(), "Sziasztok")]'))[0]
      weeklySuppe = await page.evaluate(el => el.textContent, weeklySuppeIncludes)
      weeklySuppe = weeklySuppe.replace(/(?=sziasztok)(.*)(?=levesek )|(?=mai)(.*)(?=\s*)/gi, '')
      // @ SUPPÉ Monday only (on Monday)
      const mondaySuppeIncludes = (await page.$x('//p[contains(text(), "Sziasztok")]'))[0]
      mondaySuppe = await page.evaluate(el => el.textContent, mondaySuppeIncludes)
      mondaySuppe = mondaySuppe.replace(/(?=sziasztok)(.*)(?=levesek )|(, várunk Titeket!)/gi, '')

      console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
      if (today === 1) {
        paramValueString = mondaySuppe + '\n'
        console.log('• ' + dayNames[today] + ': ' + paramValueString)
      } else {
        paramValueString = dailySuppe + '\n' + weeklySuppe + '\n'
        console.log('• ' + dayNames[today] + ': ' + paramValueString)
      }
      // @ SUPPÉ object
      let suppeObj = new RestaurantMenuOutput(paramColor, paramTitleString, paramUrl, paramIcon, paramValueString)
      finalJSON.attachments.push(suppeObj)
    } catch (e) {
      console.error(e)
    }
  }
  await suppe()

  async function karcsi() {
    /*
     * @ KARCSI
     * ------------------------------------------
     * contact info:
     * Address: Budapest, Jókai u. 20, 1066
     * Phone: (1) 312 0557
     * -----------------------------------------
     */

    // @ KARCSI parameters
    let paramColor = '#ffba44'
    let paramTitleString = 'Karcsi Vendéglö'
    let paramUrl = 'http://karcsibacsivendeglo.com/letoltes/napi_menu.pdf'
    let paramIcon =
      'https://scontent.fbud1-1.fna.fbcdn.net/v/t1.0-1/c28.22.275.275a/p320x320/579633_527729393935258_751578746_n.png?_nc_cat=111&_nc_ht=scontent.fbud1-1.fna&oh=73791f008083bd39a006894bc54655d3&oe=5D61492B'
    let paramValueString
    let weeklyKarcsi
    // @ KARCSI weekly
    weeklyKarcsi = 'http://karcsibacsivendeglo.com/letoltes/napi_menu.pdf'

    paramValueString = '• Weekly menu: ' + weeklyKarcsi + '\n'
    console.log('*' + paramTitleString + '* \n' + '-'.repeat(paramTitleString.length))
    console.log(paramValueString)
    // @ KARCSI object
    let karcsiObj = new RestaurantMenuOutput(paramColor, paramTitleString, paramUrl, paramIcon, paramValueString)
    finalJSON.attachments.push(karcsiObj)
  }
  await karcsi()

  // prepare output by stringifying the object
  finalJSON = JSON.stringify(finalJSON)
  console.log(finalJSON)

  // the final countdown (before post the actual menu to webhooks)
  const countdownto = 5
  console.log('\nWARNING: the output will be posted to slack in ' + countdownto + ' seconds!')
  for (let i = countdownto; i > 0; i--) {
    await page.waitFor(1000)
    console.log(i + '\n...')
  }
  console.log('POST')

  // _POST the final JSON to webhook
  request(
    {
      url: process.env.WEBHOOK_URL_PROD,
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
