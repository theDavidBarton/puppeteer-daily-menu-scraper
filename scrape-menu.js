// scraping with Puppeteer example
const puppeteer = require('puppeteer');
const expect = require('expect');

(async () => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewport({ width: 1024, height: 768 })

  // abort all images, source: https://github.com/GoogleChrome/puppeteer/blob/master/examples/block-images.js
      await page.setRequestInterception(true)
      page.on('request', request => {
        if (request.resourceType() === 'image')
          request.abort()
        else
          request.continue()
        })

  /*
  |------------------------------------------
  |               Korhely menu
  |------------------------------------------
  |  Address: Budapest, Liszt Ferenc tér 7, 1061
  |  Phone: (1) 321 0280
  |
  */
  console.log('*Korhely menu:* \n----------------')
  await page.goto('http://www.korhelyfaloda.hu/menu', { waitUntil: 'networkidle2', timeout: 0 })
  // stores src of given selector, source: https://stackoverflow.com/questions/52542149/how-can-i-download-images-on-a-page-using-puppeteer
  let linkSelector = '#TPASection_ije2yufiiframe'
  const linkKorhely = await page.evaluate((sel) => {
      return document.querySelector(sel).getAttribute('src')
  }, linkSelector)

  await page.goto(linkKorhely, { waitUntil: 'networkidle2', timeout: 0 })
   const weeklySummaryKorhely = await page.evaluate(el => el.innerText, await page.$('#mainDiv > div > div:nth-child(2) > section > div > div.MenusNavigation_description'))
   const weeklySoupKorhely = await page.evaluate(el => el.innerText, await page.$('#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(1)'))
   const weeklyMainKorhely = await page.evaluate(el => el.innerText, await page.$('#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(2)'))
   const weeklyDessertKorhely = await page.evaluate(el => el.innerText, await page.$('#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(3)'))

    console.log(
      '• Soups: ' + weeklySoupKorhely + '\n' +
      '• Main courses: ' + weeklyMainKorhely + '\n' +
      '• Desserts: ' + weeklyDessertKorhely + '\n'
    )

  /*
  |------------------------------------------
  |        Ketszerecsen bisztro menu
  |------------------------------------------
  |  Address: Budapest, Nagymező u. 14, 1065
  |  Phone: (1) 343 1984
  |
  */
  console.log('*Ketszerecsen Bisztro menu:* \n----------------')
  await page.goto('https://ketszerecsen.hu/#daily', { waitUntil: 'networkidle2' })
  // Monday
  const mondayKetszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(5)'))
  const mondayKetszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(6)'))
  // Tuesday
  const tuesdayKetszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(8)'))
  const tuesdayKetszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(9)'))
  // Wednesday
  const wednesdayKetszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(11)'))
  const wednesdayKetszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(12)'))
  // Thursday
  const thursdayKetszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(14)'))
  const thursdayKetszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(15)'))
  // Friday
  const fridayKetszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(17)'))
  const fridayKetszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(18)'))

    console.log(
      '• Ketszerecsen Monday menu: ' + mondayKetszerecsen1 + ', ' + mondayKetszerecsen2 + '\n' +
      '• Ketszerecsen Tuesday menu: ' + tuesdayKetszerecsen1 + ', ' + tuesdayKetszerecsen2 + '\n' +
      '• Ketszerecsen Wednesday menu: ' + wednesdayKetszerecsen1 + ', ' + wednesdayKetszerecsen2 + '\n' +
      '• Ketszerecsen Thursday menu: ' + thursdayKetszerecsen1 + ', ' + thursdayKetszerecsen2 + '\n' +
      '• Ketszerecsen Friday menu: ' + fridayKetszerecsen1 + ', ' + fridayKetszerecsen2 + '\n'
    )

  /*
  |------------------------------------------
  |     Fruccola (Arany Janos utca) menu
  |------------------------------------------
  |  Address: Budapest, Arany János u. 32, 1051
  |  Phone: (1) 430 6125
  |
  */
  console.log('*Fruccola (Arany Janos utca) menu:* \n----------------')
  await page.goto('http://fruccola.hu/hu', { waitUntil : 'networkidle2' })
  const dailyFruccola1 = await page.evaluate(el => el.innerText, await page.$('#dailymenu-holder > li.arany.today > div.soup > p.description'))
  const dailyFruccola2 = await page.evaluate(el => el.innerText, await page.$('#dailymenu-holder > li.arany.today > div.main-dish > p.description'))

    console.log('• Fruccola daily menu: ' + dailyFruccola1 + ', ' + dailyFruccola2 + '\n')

  /*
  |------------------------------------------
  |               Nokedli menu
  |------------------------------------------
  |  Address: Budapest, Weiner Leó u. 17, 1065
  |  Phone: (20) 499 5832
  |
  */
  console.log('*Nokedli menu:* \n----------------')
  await page.goto('http://nokedlikifozde.hu/', { waitUntil: 'networkidle2' })
  // stores src of given selector, source: https://stackoverflow.com/questions/52542149/how-can-i-download-images-on-a-page-using-puppeteer
  let imageSelector = '.aligncenter'
  const weeklyNokedly = await page.evaluate((sel) => {
      return document.querySelector(sel).getAttribute('src').replace('-300x212', '')
  }, imageSelector)

    console.log('• Nokedli weekly menu: ' + weeklyNokedly + '\n')

  /*
  |------------------------------------------
  |            Kamra Etelbar menu
  |------------------------------------------
  |  Address: Budapest, Hercegprímás u. 19, 1051
  |  Phone: (20) 436 9968
  |
  */
  console.log('*Kamra menu:* \n----------------')
  await page.goto('http://www.kamraetelbar.hu/kamra_etelbar_mai_menu.html', { waitUntil: 'networkidle2' })
  const dayKamra = await page.evaluate(el => el.innerText, await page.$('.shop_today_1'))

  // stores all elements with same ID, source: https://stackoverflow.com/questions/54677126/how-to-select-all-child-div-with-same-class-using-puppeteer
  const dailyKamra = await page.$$eval('.shop_today_title',
    divs => divs.map(({ innerText }) => innerText));

    console.log('• Kamra ' + dayKamra + ' daily menu: ' + dailyKamra + '\n')

  /*
  |------------------------------------------
  |            Roza menu
  |------------------------------------------
  |  Address: Budapest, Jókai u. 22, 1066
  |  Phone: (30) 611 4396
  |
  */
  console.log('*Roza menu:* \n----------------')
  await page.goto('https://www.facebook.com/pg/rozafinomitt/posts/?ref=page_internal', { waitUntil: 'networkidle2' })
  const dailyRoza = await page.evaluate(el => el.innerText, await page.$('.text_exposed_show'))

    console.log('• Roza daily menu: ' + dailyRoza + '\n')

  /*
  |------------------------------------------
  |           Chagall Cafe menu
  |------------------------------------------
  |  Address: Budapest, Hajós u. 27, 1065
  |  Phone: (1) 302 4614
  |
  */
  console.log('*Chagall menu:* \n----------------')
  await page.goto('http://chagallcafe.hu/?page_id=396', { waitUntil: 'networkidle2' })
  // Monday
  const mondayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(1) > div > ul > li > div > h4 > span.item_title'))
  // Tuesday
  const tuesdayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(2) > div > ul > li > div > h4 > span.item_title'))
  // Wednesday
  const wednesdayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(3) > div > ul > li > div > h4 > span.item_title'))
  // Thursday
  const thursdayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(4) > div > ul > li > div > h4 > span.item_title'))
  // Friday
  const fridayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(5) > div > ul > li > div > h4 > span.item_title'))

    console.log(
      '• Chagall Monday menu: ' + mondayChagall + '\n' +
      '• Chagall Tuesday menu: ' + tuesdayChagall + '\n' +
      '• Chagall Wednesday menu: ' + wednesdayChagall + '\n' +
      '• Chagall Thursday menu: ' + thursdayChagall + '\n' +
      '• Chagall Friday menu: ' + fridayChagall + '\n'
    )

  /*
  |------------------------------------------
  |            Mozsar menu
  |------------------------------------------
  |  Address: Budapest, Nagymező u. 21, 1065
  |  Phone: (70) 426 8199
  |
  */
  console.log('*Mozsár menu:* \n----------------')
  await page.goto('http://mozsarbisztro.hu/index.php?p=3', { waitUntil: 'networkidle2' })
  // Monday
  const mondayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(1) > ul > li:nth-child(1) > label'))
  const mondayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(1) > ul > li:nth-child(2) > label'))
  // Tuesday
  const tuesdayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(2) > ul > li:nth-child(1) > label'))
  const tuesdayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(2) > ul > li:nth-child(2) > label'))
  // Wednesday
  const wednesdayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(3) > ul > li:nth-child(1) > label'))
  const wednesdayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(3) > ul > li:nth-child(2) > label'))
  // Thursday
  const thursdayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(4) > ul > li:nth-child(1) > label'))
  const thursdayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(4) > ul > li:nth-child(2) > label'))
  // Friday
  const fridayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(5) > ul > li:nth-child(1) > label'))
  const fridayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(5) > ul > li:nth-child(2) > label'))

    console.log(
      '• Mozsár Monday menu: ' + mondayMozsar1 + ', ' + mondayMozsar2 + '\n' +
      '• Mozsár Tuesday menu: ' + tuesdayMozsar1 + ', ' + tuesdayMozsar2 + '\n' +
      '• Mozsár Wednesday menu: ' + wednesdayMozsar1 + ', ' + wednesdayMozsar2 + '\n' +
      '• Mozsár Thursday menu: ' + thursdayMozsar1 + ', ' + thursdayMozsar2 + '\n' +
      '• Mozsár Friday menu: ' + fridayMozsar1 + ', ' + fridayMozsar2 + '\n'
    )

  /*
  |------------------------------------------
  |         Karcsi vendeglo menu
  |------------------------------------------
  |  Address: Budapest, Jókai u. 20, 1066
  |  Phone: (1) 312 0557
  |
  */
  console.log('*Karcsi menu:* \n----------------')
  const weeklyKarcsi = 'http://karcsibacsivendeglo.com/letoltes/napi_menu.pdf'

    console.log('• Karcsi weekly menu: ' + weeklyKarcsi + '\n')

  await browser.close()
})()
