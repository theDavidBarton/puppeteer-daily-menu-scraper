// scraping with Puppeteer example
const puppeteer = require('puppeteer');
const expect = require('expect');

(async () => {
  const browser = await puppeteer.launch( {headless: false} )
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

// Chagall Cafe menu
//
// *****************

console.log('*Chagall menu:*')
  await page.goto('http://chagallcafe.hu/?page_id=396', { waitUntil: 'networkidle2' })
  // Monday
  let mondayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(1) > div > ul > li > div > h4 > span.item_title'))
    console.log('• Chagall Monday menu: ' + mondayChagall)
  // Tuesday
  let tuesdayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(2) > div > ul > li > div > h4 > span.item_title'))
    console.log('• Chagall Tuesday menu: ' + tuesdayChagall)
  // Wednesday
  let wednesdayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(3) > div > ul > li > div > h4 > span.item_title'))
    console.log('• Chagall Wednesday menu: ' + wednesdayChagall)
  // Thursday
  let thursdayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(4) > div > ul > li > div > h4 > span.item_title'))
    console.log('• Chagall Thursday menu: ' + thursdayChagall)
  // Friday
  let fridayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(5) > div > ul > li > div > h4 > span.item_title'))
    console.log('• Chagall Friday menu: ' + fridayChagall)

// Mozsár menu
//
// *****************

console.log('*Mozsár menu:*')
  await page.goto('http://mozsarbisztro.hu/index.php?p=3', { waitUntil: 'networkidle2' })
  // Monday
  let mondayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(1) > ul > li:nth-child(1) > label'))
  let mondayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(1) > ul > li:nth-child(2) > label'))
    console.log('• Mozsár Monday menu: ' + mondayMozsar1 + ', ' + mondayMozsar2)
  // Tuesday
  let tuesdayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(2) > ul > li:nth-child(1) > label'))
  let tuesdayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(2) > ul > li:nth-child(2) > label'))
    console.log('• Mozsár Tuesday menu: ' + tuesdayMozsar1 + ', ' + tuesdayMozsar2)
  // Wednesday
  let wednesdayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(3) > ul > li:nth-child(1) > label'))
  let wednesdayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(3) > ul > li:nth-child(2) > label'))
    console.log('• Mozsár Wednesday menu: ' + wednesdayMozsar1 + ', ' + wednesdayMozsar2)
  // Thursday
  let thursdayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(4) > ul > li:nth-child(1) > label'))
  let thursdayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(4) > ul > li:nth-child(2) > label'))
    console.log('• Mozsár Thursday menu: ' + thursdayMozsar1 + ', ' + thursdayMozsar2)
  // Friday
  let fridayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(5) > ul > li:nth-child(1) > label'))
  let fridayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(5) > ul > li:nth-child(2) > label'))
    console.log('• Mozsár Friday menu: ' + fridayMozsar1 + ', ' + fridayMozsar2)

  // Kamra menu
  //
  // *****************

  console.log('*Kamra menu:*')
  await page.goto('http://www.kamraetelbar.hu/kamra_etelbar_mai_menu.html', { waitUntil: 'networkidle2' })
  let dayKamra = await page.evaluate(el => el.innerHTML, await page.$('#by_one_table > tbody > tr:nth-child(3) > td > div.shop_today_1'))
  let dailyKamra = await page.evaluate(el => el.innerHTML, await page.$('#by_one_table > tbody > tr:nth-child(3) > td > div:nth-child(3)'))
    console.log('• Kamra daily menu ' + dayKamra + ': ' + dailyKamra)

  // Karcsi menu
  //
  // ****************

  console.log('*Karcsi menu:*')
  await page.goto('http://karcsibacsivendeglo.com/letoltes/napi_menu.pdf', { waitUntil: 'networkidle2' })
  let weeklyKarcsi = 'http://karcsibacsivendeglo.com/letoltes/napi_menu.pdf'
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
  let weeklySummaryKorhely = await page.evaluate(el => el.innerHTML, await page.$('#mainDiv > div > div:nth-child(2) > section > div > div.MenusNavigation_description'))
    console.log(weeklySummaryKorhely)
*/
  //let bodyHTML = await page.evaluate(() => document.body.innerHTML)
  //  console.log(bodyHTML)

  await browser.close()
})()
