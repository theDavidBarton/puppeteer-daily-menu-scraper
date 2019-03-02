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

  // Fruccola (Arany Janos utca) menu
  //
  // ****************

  console.log('*Fruccola (Arany Janos utca) menu:*')
  await page.goto('http://fruccola.hu/hu', { waitUntil : 'networkidle2' })
  const dailySoupFruccola = await page.evaluate(el => el.innerText, await page.$('#dailymenu-holder > li.arany.today > div.soup > p.description'))
  const dailyMainFruccola = await page.evaluate(el => el.innerText, await page.$('#dailymenu-holder > li.arany.today > div.main-dish > p.description'))
  console.log('• Fruccola daily menu:' + dailySoupFruccola + ', ' + dailyMainFruccola)

  // Nokedli menu
  //
  // ****************
  console.log('*Nokedli menu:*')
  await page.goto('http://nokedlikifozde.hu/', { waitUntil: 'networkidle2' })
  // stores src of given selector, source: https://stackoverflow.com/questions/52542149/how-can-i-download-images-on-a-page-using-puppeteer
  let imageSelector = '.aligncenter'
  const weeklyNokedly = await page.evaluate((sel) => {
      return document.querySelector(sel).getAttribute('src').replace('/', '')
  }, imageSelector)
    console.log('• Nokedli weekly menu: ' + weeklyNokedly)

  // Kamra menu
  //
  // *****************

  console.log('*Kamra menu:*')
  await page.goto('http://www.kamraetelbar.hu/kamra_etelbar_mai_menu.html', { waitUntil: 'networkidle2' })
  const dayKamra = await page.evaluate(el => el.innerText, await page.$('.shop_today_1'))

  // stores all elements with same ID, source: https://stackoverflow.com/questions/54677126/how-to-select-all-child-div-with-same-class-using-puppeteer
  const dailyKamra = await page.$$eval('.shop_today_title',
    divs => divs.map(({ innerText }) => innerText));

    console.log('• Kamra daily menu ' + dayKamra + ': ' + dailyKamra)

  // Roza menu
  //
  // ****************
  console.log('*Roza menu:*')
  await page.goto('https://www.facebook.com/pg/rozafinomitt/posts/?ref=page_internal', { waitUntil: 'networkidle2' })
  const dailyRoza = await page.evaluate(el => el.innerText, await page.$('.text_exposed_show'))
    console.log('• Roza daily menu: ' + dailyRoza)

// Chagall Cafe menu
//
// *****************

console.log('*Chagall menu:*')
  await page.goto('http://chagallcafe.hu/?page_id=396', { waitUntil: 'networkidle2' })
  // Monday
  const mondayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(1) > div > ul > li > div > h4 > span.item_title'))
    console.log('• Chagall Monday menu: ' + mondayChagall)
  // Tuesday
  const tuesdayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(2) > div > ul > li > div > h4 > span.item_title'))
    console.log('• Chagall Tuesday menu: ' + tuesdayChagall)
  // Wednesday
  const wednesdayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(3) > div > ul > li > div > h4 > span.item_title'))
    console.log('• Chagall Wednesday menu: ' + wednesdayChagall)
  // Thursday
  const thursdayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(4) > div > ul > li > div > h4 > span.item_title'))
    console.log('• Chagall Thursday menu: ' + thursdayChagall)
  // Friday
  const fridayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(5) > div > ul > li > div > h4 > span.item_title'))
    console.log('• Chagall Friday menu: ' + fridayChagall)

// Mozsár menu
//
// *****************

console.log('*Mozsár menu:*')
  await page.goto('http://mozsarbisztro.hu/index.php?p=3', { waitUntil: 'networkidle2' })
  // Monday
  const mondayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(1) > ul > li:nth-child(1) > label'))
  const mondayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(1) > ul > li:nth-child(2) > label'))
    console.log('• Mozsár Monday menu: ' + mondayMozsar1 + ', ' + mondayMozsar2)
  // Tuesday
  const tuesdayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(2) > ul > li:nth-child(1) > label'))
  const tuesdayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(2) > ul > li:nth-child(2) > label'))
    console.log('• Mozsár Tuesday menu: ' + tuesdayMozsar1 + ', ' + tuesdayMozsar2)
  // Wednesday
  const wednesdayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(3) > ul > li:nth-child(1) > label'))
  const wednesdayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(3) > ul > li:nth-child(2) > label'))
    console.log('• Mozsár Wednesday menu: ' + wednesdayMozsar1 + ', ' + wednesdayMozsar2)
  // Thursday
  const thursdayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(4) > ul > li:nth-child(1) > label'))
  const thursdayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(4) > ul > li:nth-child(2) > label'))
    console.log('• Mozsár Thursday menu: ' + thursdayMozsar1 + ', ' + thursdayMozsar2)
  // Friday
  const fridayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(5) > ul > li:nth-child(1) > label'))
  const fridayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(5) > ul > li:nth-child(2) > label'))
    console.log('• Mozsár Friday menu: ' + fridayMozsar1 + ', ' + fridayMozsar2)

  // Karcsi menu
  //
  // ****************

  console.log('*Karcsi menu:*')
  const weeklyKarcsi = 'http://karcsibacsivendeglo.com/letoltes/napi_menu.pdf'
    console.log('• Karcsi weekly menu:' + weeklyKarcsi)

  // Korhely menu
  //
  // ****************
/*
  console.log('Korhely menu:')
  await page.goto('http://www.korhelyfaloda.hu/menu', { waitUntil: 'networkidle2' })

  const iframe = page.frames()[1]
  const body = await iframe.$('body');
  await page.iframe.waitForSelector('#mainDiv > div > div:nth-child(1) > section > div > div.MenusNavigation_items > a:nth-child(2)')
  await page.iframe.click('#mainDiv > div > div:nth-child(1) > section > div > div.MenusNavigation_items > a:nth-child(2)')
  const weeklySummaryKorhely = await page.evaluate(el => el.innerHTML, await page.$('#mainDiv > div > div:nth-child(2) > section > div > div.MenusNavigation_description'))
    console.log(weeklySummaryKorhely)
*/
  //const bodyHTML = await page.evaluate(() => document.body.innerHTML)
  //  console.log(bodyHTML)

  await browser.close()
})()
