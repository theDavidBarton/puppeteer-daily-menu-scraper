const puppeteer = require('puppeteer')
const expect = require('expect')
async function testGoogleFlights() {
  const browser = await puppeteer.launch({ headless: false, slowmo: 20 })
  const page = await browser.newPage()
  console.log('... puppeteer has launched')

  await page.goto('https://www.google.com/flights?hl=en', {
    waitUntil: 'networkidle2',
    timeout: 0
  })
  const gooFlightFrom = '.gws-flights-form__swapper-right'
  await page.click(gooFlightFrom)
  await page.waitForSelector('#sb_ifc50 > input[type="text"]')
  await page.waitFor(500)
  await page.keyboard.type('Pari')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  let gooFlightFrom__content = await page.evaluate(el => el.innerText, await page.$(gooFlightFrom))
  expect(gooFlightFrom__content).toBe('ParisCDG')
  console.log('After CDG is selected the content of the from input is:' + gooFlightFrom__content)
  await browser.close()
}
testGoogleFlights()
