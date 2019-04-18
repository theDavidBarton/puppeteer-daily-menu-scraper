// scraping daily menus with Puppeteer
const puppeteer = require('puppeteer')
const moment = require('moment')

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

  // get Day of Week
  const today = Number(moment().format('d'))
  const dayNames = []
  for (let i = 0; i < 7; i++) {
    let day = moment(i, 'd').format('dddd')
    dayNames.push(day)
  }
  console.log('*' + dayNames[today].toUpperCase() + '*\n' + '='.repeat(dayNames[today].length))

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
  console.log('*' + suppeName + '* \n' + '-'.repeat(suppeName.length))
  await page.goto('https://www.facebook.com/pg/bistrosuppe/posts/?ref=page_internal', {
    waitUntil: 'networkidle2'
  })
  // @ SUPPÉ selector, source: https://stackoverflow.com/questions/48448586/how-to-use-xpath-in-chrome-headlesspuppeteer-evaluate
  // daily
  const dailySuppeIncludes = (await page.$x('//span[contains(text(), "Sziasztok")]'))[0]
  let dailySuppe = await page.evaluate(el => {
    return el.textContent
  }, dailySuppeIncludes)
  dailySuppe = dailySuppe.replace(/Sziasztok, |, kellemes hétvégét!|, szép napot!|, várunk Titeket!/gi, '')
  // Weekly (on Monday)
  const weeklySuppeIncludes = (await page.$x('//p[contains(text(), "Sziasztok")]'))[0]
  let weeklySuppe = await page.evaluate(el => {
    return el.textContent
  }, weeklySuppeIncludes)
  weeklySuppe = weeklySuppe.replace(/(?=sziasztok)(.*)(?=levesek )|(?=mai)(.*)(?=\s*)/gi, '')
  // Monday only (on Monday)
  const mondaySuppeIncludes = (await page.$x('//p[contains(text(), "Sziasztok")]'))[0]
  let mondaySuppe = await page.evaluate(el => {
    return el.textContent
  }, mondaySuppeIncludes)
  mondaySuppe = mondaySuppe.replace(/(?=sziasztok)(.*)(?=levesek )|(, várunk Titeket!)/gi, '')

  let nameOfDaySuppe = today
  switch (nameOfDaySuppe) {
    case 1:
      console.log('• Monday: ' + mondaySuppe + '\n')
      break
    default:
      console.log('• Daily menu: ' + dailySuppe + '\n' + weeklySuppe + '\n')
  }

  /*
  @ YAMATO
  ---------------------------------------
  contact info:
  * Address: Budapest, 1066, JÓKAI U. 30.
  * Phone: +36(70)681-75-44
  ---------------------------------------
  */

  // @ YAMATO selectors
  let yamatoArray = [
    'body > div:nth-child(1) > p:nth-child(2)',
    'body > div:nth-child(1) > p:nth-child(4)',
    'body > div:nth-child(1) > p:nth-child(6)',
    'body > div:nth-child(1) > p:nth-child(8)',
    'body > div:nth-child(1) > p:nth-child(10)'
  ]
  let yamatoName = 'Yamato menu:'
  console.log('*' + yamatoName + '* \n' + '-'.repeat(yamatoName.length))
  await page.goto('https://www.wasabi.hu/napimenu.php?source=yamato&lang=hu', {
    waitUntil: 'networkidle2',
    timout: 0
  })
  // @ YAMATO Monday-Friday
  for (let i = today - 1; i < today; i++) {
    let yamato
    if ((await page.$(yamatoArray[i])) !== null) {
      let yamatoRaw = await page.evaluate(el => el.innerText, await page.$(yamatoArray[i]))
      yamato = yamatoRaw.replace(/(\n)/gm, ', ')
    } else {
      yamato = '♪"No Milk Today"♫'
    }
    console.log('• ' + dayNames[i + 1] + ': ' + yamato + '\n')
  }

  /*
  @ VIAN
  ------------------------------------------
  contact info:
  * Address: Budapest, Liszt Ferenc tér 9, 1061
  * Phone: (1) 268 1154
  -----------------------------------------
  */

  let vianArray1 = [
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(1) > div:nth-child(1) > div.heartyQ2riU',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(2) > div:nth-child(1) > div.heartyQ2riU',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(3) > div:nth-child(1) > div.heartyQ2riU',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(4) > div:nth-child(1) > div.heartyQ2riU',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(5) > div:nth-child(1) > div.heartyQ2riU'
  ]
  let vianArray2 = [
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(1) > div.hearty2QDOd > div > div > div.heartyQogjj > span',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(2) > div.hearty2QDOd > div > div > div.heartyQogjj > span',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(3) > div.hearty2QDOd > div > div > div.heartyQogjj > span',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(4) > div.hearty2QDOd > div > div > div.heartyQogjj > span',
    '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(5) > div.hearty2QDOd > div > div > div.heartyQogjj > span'
  ]
  let vianName = 'Cafe vian menu:'
  console.log('*' + vianName + '* \n' + '-'.repeat(vianName.length))
  await page.goto('http://www.cafevian.com/ebedmenue', {
    waitUntil: 'networkidle2',
    timeout: 0
  })
  // stores src of given selector, source: https://stackoverflow.com/questions/52542149/how-can-i-download-images-on-a-page-using-puppeteer
  let linkSelectorVian = '#TPASection_jkic76naiframe'
  const linkVian = await page.evaluate(sel => {
    return document.querySelector(sel).getAttribute('src')
  }, linkSelectorVian)
  await page.goto(linkVian, { waitUntil: 'networkidle2', timeout: 0 })

  // @ VIAN Monday-Friday
  for (let i = today - 1; i < today; i++) {
    let vian1
    let vian2
    if ((await page.$(vianArray1[i])) !== null) {
      vian1 = await page.evaluate(el => el.innerText, await page.$(vianArray1[i]))
      vian2 = await page.evaluate(el => el.innerText, await page.$(vianArray2[i]))
    } else {
      vian1 = '♪"No Milk Today"♫'
      vian2 = ''
    }
    console.log('• ' + dayNames[i + 1] + ': ' + vian1 + ', ' + vian2 + '\n')
  }

  /*
  @ A-PECSENYES
  ------------------------------------------
  contact info:
  * Address: 1051 Budapest, Sas utca 25.
  * Phone: 36-1-610-0645
  -----------------------------------------
  */

  const dailyPecsenyesSelector = '#tabsContent1 > div'

  let pecsenyesName = 'A-Pecsenyés menu:'
  console.log('*' + pecsenyesName + '* \n' + '-'.repeat(pecsenyesName.length))
  await page.goto('http://www.napimenu.hu/budapest/adatlap/a-pecsenyes', {
    waitUntil: 'networkidle2'
  })
  let dailyPecsenyes = await page.evaluate(el => el.innerText, await page.$(dailyPecsenyesSelector))
  dailyPecsenyes = dailyPecsenyes.replace(/(\n)/gm, ', ')
  dailyPecsenyes = dailyPecsenyes.replace('Napi ebéd menü A-Pecsenyés, ', '')

  console.log('• Daily menu: ' + dailyPecsenyes + '\n')

  /*
  @ KORHELY
  ---------------------------------------------
  contact info:
  * Address: Budapest, Liszt Ferenc tér 7, 1061
  * Phone: (1) 321 0280
  ---------------------------------------------

  korhelyName, korhelyLength
  * the restaurant title
  * the calculated length of title string
  * underlined in length of title
  */

  const weeklySoupKorhelySelector = '#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(1)'
  const weeklyMainKorhelySelector = '#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(2)'
  const weeklyDessertKorhelySelector = '#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(3)'

  let korhelyName = 'Korhely menu:'
  console.log('*' + korhelyName + '* \n' + '-'.repeat(korhelyName.length))
  await page.goto('http://www.korhelyfaloda.hu/menu', {
    waitUntil: 'networkidle2',
    timeout: 0
  })
  // stores src of given selector, source: https://stackoverflow.com/questions/52542149/how-can-i-download-images-on-a-page-using-puppeteer
  let linkSelectorKorhely = '#TPASection_ije2yufiiframe'
  const linkKorhely = await page.evaluate(sel => {
    return document.querySelector(sel).getAttribute('src')
  }, linkSelectorKorhely)

  await page.goto(linkKorhely, { waitUntil: 'networkidle2', timeout: 0 })
  // let weeklySummaryKorhely = await page.evaluate(el => el.innerText, await page.$(weeklySummaryKorhelySelector))
  let weeklySoupKorhely = await page.evaluate(el => el.innerText, await page.$(weeklySoupKorhelySelector))
  weeklySoupKorhely = weeklySoupKorhely.replace('LEVESEK', '')
  let weeklyMainKorhely = await page.evaluate(el => el.innerText, await page.$(weeklyMainKorhelySelector))
  weeklyMainKorhely = weeklyMainKorhely.replace('FŐÉTELEK', '')
  let weeklyDessertKorhely = await page.evaluate(el => el.innerText, await page.$(weeklyDessertKorhelySelector))
  weeklyDessertKorhely = weeklyDessertKorhely.replace('DESSZERTEK', '')

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

  /*
  @ KETSZERECSEN
  ------------------------------------------
  contact info:
  * Address: Budapest, Nagymező u. 14, 1065
  * Phone: (1) 343 1984
  -----------------------------------------
  */

  let ketszerecsenArray1 = ['p:nth-child(4)', 'p:nth-child(7)', 'p:nth-child(10)', 'p:nth-child(13)', 'p:nth-child(16)']
  let ketszerecsenArray2 = ['p:nth-child(5)', 'p:nth-child(8)', 'p:nth-child(11)', 'p:nth-child(14)', 'p:nth-child(17)']

  let ketszerecsenName = 'Ketszerecsen Bisztro menu:'
  console.log('*' + ketszerecsenName + '* \n' + '-'.repeat(ketszerecsenName.length))
  await page.goto('https://ketszerecsen.hu/#daily', {
    waitUntil: 'networkidle2'
  })

  // @ KETSZERECSEN Monday-Friday
  for (let i = today - 1; i < today; i++) {
    let ketszerecsen1
    let ketszerecsen2
    if ((await page.$(ketszerecsenArray1[i])) !== null) {
      ketszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$(ketszerecsenArray1[i]))
      ketszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$(ketszerecsenArray2[i]))
    } else {
      ketszerecsen1 = '♪"No Milk Today"♫'
      ketszerecsen2 = ''
    }
    console.log('• ' + dayNames[i + 1] + ': ' + ketszerecsen1 + ', ' + ketszerecsen2 + '\n')
  }

  /*
  @ FRUCCOLA
  ----------------------------------------------
  contact info:
  * Address: Budapest, Arany János u. 32, 1051
  * Phone: (1) 430 6125
  ----------------------------------------------
  */

  const dailyFruccolaSelector1 = '#dailymenu-holder > li.arany.today > div.soup > p.description'
  const dailyFruccolaSelector2 = '#dailymenu-holder > li.arany.today > div.main-dish > p.description'

  let fruccolaName = 'Fruccola (Arany Janos utca) menu:'
  console.log('*' + fruccolaName + '* \n' + '-'.repeat(fruccolaName.length))
  await page.goto('http://fruccola.hu/hu', { waitUntil: 'networkidle2' })
  const dailyFruccola1 = await page.evaluate(el => el.innerText, await page.$(dailyFruccolaSelector1))
  const dailyFruccola2 = await page.evaluate(el => el.innerText, await page.$(dailyFruccolaSelector2))

  console.log('• Daily menu: ' + dailyFruccola1 + ', ' + dailyFruccola2 + '\n')

  /*
  @ KAMRA
  ------------------------------------------
  contact info:
  * Address: Budapest, Hercegprímás u. 19, 1051
  * Phone: (20) 436 9968
  -----------------------------------------
  */

  const dayKamraSelector = '.shop_today_1'
  const dailyKamraSelector = '.shop_today_title'

  let kamraName = 'Kamra menu:'
  console.log('*' + kamraName + '* \n' + '-'.repeat(kamraName.length))
  await page.goto('http://www.kamraetelbar.hu/kamra_etelbar_mai_menu.html', {
    waitUntil: 'networkidle2'
  })
  const dayKamra = await page.evaluate(el => el.innerText, await page.$(dayKamraSelector))
  // stores all elements with same ID, source: https://stackoverflow.com/questions/54677126/how-to-select-all-child-div-with-same-class-using-puppeteer
  const dailyKamra = await page.$$eval(dailyKamraSelector, divs => divs.map(({ innerText }) => innerText))

  console.log('• ' + dayKamra + ' daily menu: ' + dailyKamra + '\n')

  /*
  @ ROZA
  ------------------------------------------
  contact info:
  * Address: Budapest, Jókai u. 22, 1066
  * Phone: (30) 611 4396
  -----------------------------------------
  */

  const dailyRozaSelector = '.text_exposed_show'

  let rozaName = 'Roza menu:'
  console.log('*' + rozaName + '* \n' + '-'.repeat(rozaName.length))
  await page.goto('https://www.facebook.com/pg/rozafinomitt/posts/?ref=page_internal', {
    waitUntil: 'networkidle2'
  })
  let dailyRoza = await page.evaluate(el => el.innerText, await page.$(dailyRozaSelector))
  dailyRoza = dailyRoza.replace(/🍲|🥪|🥧|❤️/g, '')

  console.log('• Daily menu: ' + dailyRoza + '\n')

  /*
  @ KARCSI
  ------------------------------------------
  contact info:
  * Address: Budapest, Jókai u. 20, 1066
  * Phone: (1) 312 0557
  -----------------------------------------

  karcsiName, karcsiLength
  * the restaurant title
  * the calculated length of title string
  * underlined in length of title
  */

  let karcsiName = 'Karcsi menu:'
  console.log('*' + karcsiName + '* \n' + '-'.repeat(karcsiName.length))
  const weeklyKarcsi = 'http://karcsibacsivendeglo.com/letoltes/napi_menu.pdf'

  console.log('• Weekly menu: ' + weeklyKarcsi + '\n')

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
  */

  const imageNokedliSelector = '.aligncenter'

  let nokedliName = 'Nokedli menu:'
  console.log('*' + nokedliName + '* \n' + '-'.repeat(nokedliName.length))
  await page.goto('http://nokedlikifozde.hu/', { waitUntil: 'networkidle2' })
  // stores src of given selector, source: https://stackoverflow.com/questions/52542149/how-can-i-download-images-on-a-page-using-puppeteer
  let imageSelector = imageNokedliSelector
  const weeklyNokedly = await page.evaluate(sel => {
    return document
      .querySelector(sel)
      .getAttribute('src')
      .replace('-300x212', '')
  }, imageSelector)

  console.log('• Weekly menu: ' + weeklyNokedly + '\n')

  await browser.close()
}
scrapeMenu()
