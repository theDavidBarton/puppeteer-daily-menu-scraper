const puppeteer = require('puppeteer')
const expect = require('expect')
async function testGoogleFlights() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 40 })
  const page = await browser.newPage()
  await page.setViewport({ width: 1024, height: 768 })
  console.log('... puppeteer has launched')
  // abort all images, source: https://github.com/GoogleChrome/puppeteer/blob/master/examples/block-images.js
  await page.setRequestInterception(true)
  page.on('request', request => {
    if (request.resourceType() === 'image') {
      request.abort()
    } else {
      request.continue()
    }
  })

  await page.goto('https://www.google.com/flights?hl=en', {
    waitUntil: 'networkidle0',
    timeout: 0
  })
  // from
  const gooFlightFrom = '.gws-flights-form__swapper-right'
  await page.click(gooFlightFrom)
  await page.waitForSelector('destination-picker')
  await page.waitFor(1000)
  await page.keyboard.type('Pari')
  await page.waitForSelector('.fsapp-option-content')
  await page.click('.fsapp-option-content')[1]
  await page.waitForSelector('.flt-focus')
  let gooFlightFrom__content = await page.evaluate(el => el.innerText, await page.$(gooFlightFrom))
  expect(gooFlightFrom__content).toContain('Paris')
  console.log('Selected departure: ' + gooFlightFrom__content)
  // to
  const gooFlightTo = '.gws-flights-form__swapper-left'
  await page.click(gooFlightTo)
  await page.waitForSelector('destination-picker')
  await page.waitFor(1000)
  await page.keyboard.type('San f')
  await page.waitForSelector('.fsapp-option-content')
  await page.click('.fsapp-option-content')[0]
  await page.waitForSelector('.flt-focus')
  let gooFlightTo__content = await page.evaluate(el => el.innerText, await page.$(gooFlightTo))
  expect(gooFlightTo__content).toContain('San Francisco')
  console.log('Selected destination: ' + gooFlightTo__content)
  // search submit
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Tab')
  }
  await page.keyboard.press('Enter')
  await page.waitForSelector('.gws-flights-results__price')
  let cheapestTicket = await page.evaluate(
    el => el.innerText,
    (await page.$$('.gws-flights-results__price'))[0]
  )
  console.log('Cheapest ticket price: ' + cheapestTicket)
  await browser.close()
}
testGoogleFlights()
