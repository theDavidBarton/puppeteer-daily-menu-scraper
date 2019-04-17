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
  const todayMomentLower = moment().format('dddd')
  const todayMomentUpper = todayMomentLower.toUpperCase()
  console.log('*' + todayMomentUpper + '*\n' + '='.repeat(todayMomentUpper.length))
  const today = Number(moment().format('d'))

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
  // weekly (on Monday)
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

  // @ SUPPÉ print menu
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
  <dayname>YamatoSelector(const)
  * exact selector for <dayname> menu

  <dayname>YamatoRaw, <dayname>Yamato(let)
  * raw content of <dayname>YamatoSelector
  * content of <dayname>YamatoSelector

  yamatoName, yamatoLength
  * the restaurant title
  * the calculated length of title string
  * underlined in length of title

  */

  // @ YAMATO selectors
  const mondayYamatoSelector = 'body > div:nth-child(1) > p:nth-child(2)'
  const tuesdayYamatoSelector = 'body > div:nth-child(1) > p:nth-child(4)'
  const wednesdayYamatoSelector = 'body > div:nth-child(1) > p:nth-child(6)'
  const thursdayYamatoSelector = 'body > div:nth-child(1) > p:nth-child(8)'
  const fridayYamatoSelector = 'body > div:nth-child(1) > p:nth-child(10)'

  let yamatoName = 'Yamato menu:'
  console.log('*' + yamatoName + '* \n' + '-'.repeat(yamatoName.length))
  await page.goto('https://www.wasabi.hu/napimenu.php?source=yamato&lang=hu', {
    waitUntil: 'networkidle2',
    timout: 0
  })
  // @ YAMATO Monday
  let mondayYamato
  if ((await page.$(mondayYamatoSelector)) !== null) {
    let mondayYamatoRaw = await page.evaluate(el => el.innerText, await page.$(mondayYamatoSelector))
    mondayYamato = mondayYamatoRaw.replace(/(\n)/gm, ', ')
  } else {
    mondayYamato = '♪"No Milk Today"♫'
  }
  // @ YAMATO Tuesday
  let tuesdayYamato
  if ((await page.$(tuesdayYamatoSelector)) !== null) {
    let tuesdayYamatoRaw = await page.evaluate(el => el.innerText, await page.$(tuesdayYamatoSelector))
    tuesdayYamato = tuesdayYamatoRaw.replace(/(\n)/gm, ', ')
  } else {
    tuesdayYamato = '♪"No Milk Today"♫'
  }
  // @ YAMATO Wednesday
  let wednesdayYamato
  if ((await page.$(wednesdayYamatoSelector)) !== null) {
    let wednesdayYamatoRaw = await page.evaluate(el => el.innerText, await page.$(wednesdayYamatoSelector))
    wednesdayYamato = wednesdayYamatoRaw.replace(/(\n)/gm, ', ')
  } else {
    wednesdayYamato = '♪"No Milk Today"♫'
  }
  // @ YAMATO Thursday
  let thursdayYamato
  if ((await page.$(thursdayYamatoSelector)) !== null) {
    let thursdayYamatoRaw = await page.evaluate(el => el.innerText, await page.$(thursdayYamatoSelector))
    thursdayYamato = thursdayYamatoRaw.replace(/(\n)/gm, ', ')
  } else {
    thursdayYamato = '♪"No Milk Today"♫'
  }
  // @ YAMATO Friday
  let fridayYamato
  if ((await page.$(fridayYamatoSelector)) !== null) {
    let fridayYamatoRaw = await page.evaluate(el => el.innerText, await page.$(fridayYamatoSelector))
    fridayYamato = fridayYamatoRaw.replace(/(\n)/gm, ', ')
  } else {
    fridayYamato = '♪"No Milk Today"♫'
  }

  // @ YAMATO print menu
  let nameOfDayYamato = today
  switch (nameOfDayYamato) {
    case 1:
      console.log('• Monday: ' + mondayYamato + '\n')
      break
    case 2:
      console.log('• Tuesday: ' + tuesdayYamato + '\n')
      break
    case 3:
      console.log('• Wednesday: ' + wednesdayYamato + '\n')
      break
    case 4:
      console.log('• Thursday: ' + thursdayYamato + '\n')
      break
    case 5:
      console.log('• Friday: ' + fridayYamato + '\n')
      break
    default:
      console.log(
        '• Monday: ' +
          mondayYamato +
          '\n' +
          '• Tuesday: ' +
          tuesdayYamato +
          '\n' +
          '• Wednesday: ' +
          wednesdayYamato +
          '\n' +
          '• Thursday: ' +
          thursdayYamato +
          '\n' +
          '• Friday: ' +
          fridayYamato +
          '\n'
      )
  }

  /*

  @ VIAN
  ------------------------------------------
  contact info:
  * Address: Budapest, Liszt Ferenc tér 9, 1061
  * Phone: (1) 268 1154
  -----------------------------------------

  <dayname>VianSelector1-2(const)
  * exact selector for <dayname> menu
  * main courses and desserts are scraped
    from different selectors [1-2]

  <dayname>Vian1-2(let)
  * content of <dayname>VianSelector
  * main courses and desserts are scraped
    from different selectors [1-2]

  VianName, VianLength
  * the restaurant title
  * the calculated length of title string
  * underlined in length of title

  */

  // @ VIAN selectors
  const mondayVianSelector1 = '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(1) > div:nth-child(1) > div.heartyQ2riU'
  const mondayVianSelector2 = '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(1) > div.hearty2QDOd > div > div > div.heartyQogjj > span'
  const tuesdayVianSelector1 = '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(2) > div:nth-child(1) > div.heartyQ2riU'
  const tuesdayVianSelector2 = '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(2) > div.hearty2QDOd > div > div > div.heartyQogjj > span'
  const wednesdayVianSelector1 = '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(3) > div:nth-child(1) > div.heartyQ2riU'
  const wednesdayVianSelector2 = '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(3) > div.hearty2QDOd > div > div > div.heartyQogjj > span'
  const thursdayVianSelector1 = '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(4) > div:nth-child(1) > div.heartyQ2riU'
  const thursdayVianSelector2 = '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(4) > div.hearty2QDOd > div > div > div.heartyQogjj > span'
  const fridayVianSelector1 = '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(5) > div:nth-child(1) > div.heartyQ2riU'
  const fridayVianSelector2 = '#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(5) > div.hearty2QDOd > div > div > div.heartyQogjj > span'

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

  // @ VIAN Monday
  let mondayVian1
  let mondayVian2
  if ((await page.$(mondayVianSelector1)) !== null) {
    mondayVian1 = await page.evaluate(el => el.innerText, await page.$(mondayVianSelector1))
    mondayVian2 = await page.evaluate(el => el.innerText, await page.$(mondayVianSelector2))
  } else {
    mondayVian1 = '♪"No Milk Today"♫'
    mondayVian2 = ''
  }
  // @ VIAN Tuesday
  let tuesdayVian1
  let tuesdayVian2
  if ((await page.$(tuesdayVianSelector1)) !== null) {
    tuesdayVian1 = await page.evaluate(el => el.innerText, await page.$(tuesdayVianSelector1))
    tuesdayVian2 = await page.evaluate(el => el.innerText, await page.$(tuesdayVianSelector2))
  } else {
    tuesdayVian1 = '♪"No Milk Today"♫'
    tuesdayVian2 = ''
  }
  // @ VIAN Wednesday
  let wednesdayVian1
  let wednesdayVian2
  if ((await page.$(wednesdayVianSelector1)) !== null) {
    wednesdayVian1 = await page.evaluate(el => el.innerText, await page.$(wednesdayVianSelector1))
    wednesdayVian2 = await page.evaluate(el => el.innerText, await page.$(wednesdayVianSelector2))
  } else {
    wednesdayVian1 = '♪"No Milk Today"♫'
    wednesdayVian1 = ''
  }
  // @ VIAN Thursday
  let thursdayVian1
  let thursdayVian2
  if ((await page.$(thursdayVianSelector1)) !== null) {
    thursdayVian1 = await page.evaluate(el => el.innerText, await page.$(thursdayVianSelector1))
    thursdayVian2 = await page.evaluate(el => el.innerText, await page.$(thursdayVianSelector2))
  } else {
    thursdayVian1 = '♪"No Milk Today"♫'
    thursdayVian2 = ''
  }
  // @ VIAN Friday
  let fridayVian1
  let fridayVian2
  if ((await page.$(fridayVianSelector1)) !== null) {
    fridayVian1 = await page.evaluate(el => el.innerText, await page.$(fridayVianSelector1))
    fridayVian2 = await page.evaluate(el => el.innerText, await page.$(fridayVianSelector2))
  } else {
    fridayVian1 = '♪"No Milk Today"♫'
    fridayVian2 = ''
  }
  // @ VIAN print menu
  let nameOfDayVian = today
  switch (nameOfDayVian) {
    case 1:
      console.log('• Monday: ' + mondayVian1 + ', ' + mondayVian2 + '\n')
      break
    case 2:
      console.log('• Tuesday: ' + tuesdayVian1 + ', ' + tuesdayVian2 + '\n')
      break
    case 3:
      console.log('• Wednesday: ' + wednesdayVian1 + ', ' + wednesdayVian2 + '\n')
      break
    case 4:
      console.log('• Thursday: ' + thursdayVian1 + ', ' + thursdayVian2 + '\n')
      break
    case 5:
      console.log('• Friday: ' + fridayVian1 + ', ' + fridayVian2 + '\n')
      break
    default:
      console.log(
        '• Monday: ' +
          mondayVian1 +
          ', ' +
          mondayVian2 +
          '\n' +
          '• Tuesday: ' +
          tuesdayVian1 +
          ', ' +
          tuesdayVian2 +
          '\n' +
          '• Wednesday: ' +
          wednesdayVian1 +
          ', ' +
          wednesdayVian2 +
          '\n' +
          '• Thursday: ' +
          thursdayVian1 +
          ', ' +
          thursdayVian2 +
          '\n' +
          '• Friday: ' +
          fridayVian1 +
          ', ' +
          fridayVian2 +
          '\n'
      )
  }

  /*

  @ A-PECSENYES
  ------------------------------------------
  contact info:
  * Address: 1051 Budapest, Sas utca 25.
  * Phone: 36-1-610-0645
  -----------------------------------------

  <dayname>Pecsenyes(let)
  * content of menu

  PecsenyesName, PecsenyesLength
  * the restaurant title
  * the calculated length of title string
  * underlined in length of title

  */

  // @ A-PECSENYES selectors
  const dailyPecsenyesSelector = '#tabsContent1 > div'

  let pecsenyesName = 'A-Pecsenyés menu:'
  console.log('*' + pecsenyesName + '* \n' + '-'.repeat(pecsenyesName.length))
  await page.goto('http://www.napimenu.hu/budapest/adatlap/a-pecsenyes', {
    waitUntil: 'networkidle2'
  })
  let dailyPecsenyes = await page.evaluate(el => el.innerText, await page.$(dailyPecsenyesSelector))
  dailyPecsenyes = dailyPecsenyes.replace(/(\n)/gm, ', ') // removal of line breaks from string, source: https://www.textfixer.com/tutorials/javascript-line-breaks.php
  dailyPecsenyes = dailyPecsenyes.replace('Napi ebéd menü A-Pecsenyés, ', '')

  // @ A-PECSENYES print menu
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

  // @ KORHELY selectors
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

  // @ KORHELY print menu
  console.log('• Soups: ' + weeklySoupKorhely + '\n' + '• Main courses: ' + weeklyMainKorhely + '\n' + '• Desserts: ' + weeklyDessertKorhely + '\n')

  /*

  @ KETSZERECSEN
  ------------------------------------------
  contact info:
  * Address: Budapest, Nagymező u. 14, 1065
  * Phone: (1) 343 1984
  -----------------------------------------

  <dayname>KetszerecsenSelector1-2(const)
  * exact selector for <dayname> menu
  * main courses and desserts are scraped
    from different selectors [1-2]

  <dayname>Ketszerecsen1-2(let)
  * content of <dayname>KetszerecsenSelector
  * main courses and desserts are scraped
    from different selectors [1-2]

  KetszerecsenName, KetszerecsenLength
  * the restaurant title
  * the calculated length of title string
  * underlined in length of title

  */

  // @ KETSZERECSEN selectors
  const mondayKetszerecsenSelector1 = 'p:nth-child(5)'
  const mondayKetszerecsenSelector2 = 'p:nth-child(6)'
  const tuesdayKetszerecsenSelector1 = 'p:nth-child(8)'
  const tuesdayKetszerecsenSelector2 = 'p:nth-child(9)'
  const wednesdayKetszerecsenSelector1 = 'p:nth-child(11)'
  const wednesdayKetszerecsenSelector2 = 'p:nth-child(12)'
  const thursdayKetszerecsenSelector1 = 'p:nth-child(14)'
  const thursdayKetszerecsenSelector2 = 'p:nth-child(15)'
  const fridayKetszerecsenSelector1 = 'p:nth-child(17)'
  const fridayKetszerecsenSelector2 = 'p:nth-child(18)'

  let ketszerecsenName = 'Ketszerecsen Bisztro menu:'
  console.log('*' + ketszerecsenName + '* \n' + '-'.repeat(ketszerecsenName.length))
  await page.goto('https://ketszerecsen.hu/#daily', {
    waitUntil: 'networkidle2'
  })

  // @ KETSZERECSEN Monday
  let mondayKetszerecsen1
  let mondayKetszerecsen2
  if ((await page.$(mondayKetszerecsenSelector1)) !== null) {
    mondayKetszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$(mondayKetszerecsenSelector1))
    mondayKetszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$(mondayKetszerecsenSelector2))
  } else {
    mondayKetszerecsen1 = '♪"No Milk Today"♫'
    mondayKetszerecsen2 = ''
  }
  // @ KETSZERECSEN Tuesday
  let tuesdayKetszerecsen1
  let tuesdayKetszerecsen2
  if ((await page.$(tuesdayKetszerecsenSelector1)) !== null) {
    tuesdayKetszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$(tuesdayKetszerecsenSelector1))
    tuesdayKetszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$(tuesdayKetszerecsenSelector2))
  } else {
    tuesdayKetszerecsen1 = '♪"No Milk Today"♫'
    tuesdayKetszerecsen2 = ''
  }
  // @ KETSZERECSEN Wednesday
  let wednesdayKetszerecsen1
  let wednesdayKetszerecsen2
  if ((await page.$(wednesdayKetszerecsenSelector1)) !== null) {
    wednesdayKetszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$(wednesdayKetszerecsenSelector1))
    wednesdayKetszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$(wednesdayKetszerecsenSelector2))
  } else {
    wednesdayKetszerecsen1 = '♪"No Milk Today"♫'
    wednesdayKetszerecsen2 = ''
  }
  // @ KETSZERECSEN Thursday
  let thursdayKetszerecsen1
  let thursdayKetszerecsen2
  if ((await page.$(thursdayKetszerecsenSelector1)) !== null) {
    thursdayKetszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$(thursdayKetszerecsenSelector1))
    thursdayKetszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$(thursdayKetszerecsenSelector2))
  } else {
    thursdayKetszerecsen1 = '♪"No Milk Today"♫'
    thursdayKetszerecsen2 = ''
  }
  // @ KETSZERECSEN Friday
  let fridayKetszerecsen1
  let fridayKetszerecsen2
  if ((await page.$(fridayKetszerecsenSelector1)) !== null) {
    fridayKetszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$(fridayKetszerecsenSelector1))
    fridayKetszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$(fridayKetszerecsenSelector2))
  } else {
    fridayKetszerecsen1 = '♪"No Milk Today"♫'
    fridayKetszerecsen2 = ''
  }

  // @ KETSZERECSEN print menu
  let nameOfDayKetszerecsen = today
  switch (nameOfDayKetszerecsen) {
    case 1:
      console.log('• Monday: ' + mondayKetszerecsen1 + ', ' + mondayKetszerecsen2 + '\n')
      break
    case 2:
      console.log('• Tuesday: ' + tuesdayKetszerecsen1 + ', ' + tuesdayKetszerecsen2 + '\n')
      break
    case 3:
      console.log('• Wednesday: ' + wednesdayKetszerecsen1 + ', ' + wednesdayKetszerecsen2 + '\n')
      break
    case 4:
      console.log('• Thursday: ' + thursdayKetszerecsen1 + ', ' + thursdayKetszerecsen2 + '\n')
      break
    case 5:
      console.log('• Friday: ' + fridayKetszerecsen1 + ', ' + fridayKetszerecsen2 + '\n')
      break
    default:
      console.log(
        '• Monday: ' +
          mondayKetszerecsen1 +
          ', ' +
          mondayKetszerecsen2 +
          '\n' +
          '• Tuesday: ' +
          tuesdayKetszerecsen1 +
          ', ' +
          tuesdayKetszerecsen2 +
          '\n' +
          '• Wednesday: ' +
          wednesdayKetszerecsen1 +
          ', ' +
          wednesdayKetszerecsen2 +
          '\n' +
          '• Thursday: ' +
          thursdayKetszerecsen1 +
          ', ' +
          thursdayKetszerecsen2 +
          '\n' +
          '• Friday: ' +
          fridayKetszerecsen1 +
          ', ' +
          fridayKetszerecsen2 +
          '\n'
      )
  }

  /*

  @ FRUCCOLA
  ----------------------------------------------
  contact info:
  * Address: Budapest, Arany János u. 32, 1051
  * Phone: (1) 430 6125
  ----------------------------------------------

  fruccolaName, fruccolaLength
  * the restaurant title
  * the calculated length of title string
  * underlined in length of title

  */

  // @ FRUCCOLA selectors
  const dailyFruccolaSelector1 = '#dailymenu-holder > li.arany.today > div.soup > p.description'
  const dailyFruccolaSelector2 = '#dailymenu-holder > li.arany.today > div.main-dish > p.description'

  let fruccolaName = 'Fruccola (Arany Janos utca) menu:'
  console.log('*' + fruccolaName + '* \n' + '-'.repeat(fruccolaName.length))
  await page.goto('http://fruccola.hu/hu', { waitUntil: 'networkidle2' })
  const dailyFruccola1 = await page.evaluate(el => el.innerText, await page.$(dailyFruccolaSelector1))
  const dailyFruccola2 = await page.evaluate(el => el.innerText, await page.$(dailyFruccolaSelector2))

  // @ FRUCCOLA print menu
  console.log('• Daily menu: ' + dailyFruccola1 + ', ' + dailyFruccola2 + '\n')

  /*

  @ KAMRA
  ------------------------------------------
  contact info:
  * Address: Budapest, Hercegprímás u. 19, 1051
  * Phone: (20) 436 9968
  -----------------------------------------

  kamraName, kamraLength
  * the restaurant title
  * the calculated length of title string
  * underlined in length of title

  dayKamraSelector
  dayKamra
  * the daily menu' date

  dailyKamraSelector
  * exact selector for the daily menu's content

  dailyKamra
  * menu content

  */

  // @ KAMRA selectors
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

  // @ KAMRA print menu
  console.log('• ' + dayKamra + ' daily menu: ' + dailyKamra + '\n')

  /*

  @ ROZA
  ------------------------------------------
  contact info:
  * Address: Budapest, Jókai u. 22, 1066
  * Phone: (30) 611 4396
  -----------------------------------------

  rozaName, rozaLength
  * the restaurant title
  * the calculated length of title string
  * underlined in length of title

  */

  // @ ROZA selectors
  const dailyRozaSelector = '.text_exposed_show'

  let rozaName = 'Roza menu:'
  console.log('*' + rozaName + '* \n' + '-'.repeat(rozaName.length))
  await page.goto('https://www.facebook.com/pg/rozafinomitt/posts/?ref=page_internal', {
    waitUntil: 'networkidle2'
  })
  let dailyRoza = await page.evaluate(el => el.innerText, await page.$(dailyRozaSelector))
  dailyRoza = dailyRoza.replace(/🍲|🥪|🥧|❤️/g, '')

  // @ ROZA print menu
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

  // @ KARCSI print menu
  console.log('• Weekly menu: ' + weeklyKarcsi + '\n')

  /*

  @ NOKEDLI
  ------------------------------------------
  contact info:
  * Address: Budapest, Weiner Leó u. 17, 1065
  * Phone: (20) 499 5832
  -----------------------------------------

  nokedliName, nokedliLength
  * the restaurant title
  * the calculated length of title string
  * underlined in length of title

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

  // @ NOKEDLI print menu
  console.log('• Weekly menu: ' + weeklyNokedly + '\n')

  await browser.close()
}
scrapeMenu()
