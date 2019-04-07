// BE CAREFUL! THERE'S A CROCODILE IN THE BASEMENT.
const puppeteer = require('puppeteer')
async function testGoogleMaps() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 20 })
  const page = await browser.newPage()
  const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 0 })

  await page.goto('https://www.google.com/maps?hl=en', { waitUntil: 'networkidle0', timeout: 0 })
  await page.waitForSelector('#minimap > div > div.widget-minimap > button')
  await page.click('#minimap > div > div.widget-minimap > button')
  await page.click('button.widget-consent-button-later.ripple-container')
  await page.waitForSelector('#searchboxinput')
  await page.keyboard.type('Eifell Tower Paris')
  await page.keyboard.press('Enter')
  await page.waitFor(8000)
  await navigationPromise
  await page.waitForSelector('.widget-pane-toggle-button')
  await page.click('.widget-pane-toggle-button')
  console.log('pane appeared and closed')

  for (let i = 0; i < 15; i++) {
    await page.click('#widget-zoom-out')
  }
  await page.waitFor(4000)
  await page.screenshot({ path: 'tmp/maps-out.png' })
  console.log('we are at outer space')
  for (let i = 0; i < 30; i++) {
    await page.click('#widget-zoom-in')
  }
  await page.waitFor(4000)
  await page.screenshot({ path: 'tmp/maps-in.png' })
  console.log('welcome to Paris!')
  await browser.close()
}
testGoogleMaps()
/*--------------
  🐊
*/
