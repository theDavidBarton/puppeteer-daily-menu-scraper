// Be careful! There is a crocodile in the basement.
const puppeteer = require('puppeteer')
async function testGoogleMaps() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 20 })
  const page = await browser.newPage()

  await page.goto('https://www.google.com/maps?hl=en', { waitUntil: 'networkidle0', timeout: 0 })
  await page.waitForSelector('#minimap > div > div.widget-minimap > button')
  await page.click('#minimap > div > div.widget-minimap > button')
  await page.click('button.widget-consent-button-later.ripple-container')
  await page.waitForSelector('#searchboxinput')
  await page.keyboard.type('Eifell Tower Paris')
  await page.keyboard.press('Enter')
  //await page.waitFor(8000) // this part requires better promise handling
  await page.waitForSelector('.widget-pane-toggle-button', { visible: true })
  await page.waitFor(4000)
  await page.click('.widget-pane-toggle-button')
  console.log('pane appeared and closed')
  for (let i = 0; i < 15; i++) {
    await page.click('#widget-zoom-out')
  }
  await page.waitFor(4000)
  await page.screenshot({ path: 'tmp/maps-out.png' })
  console.log('We are outer space!')
  for (let i = 0; i < 20; i++) {
    await page.click('#widget-zoom-in')
  }
  await page.waitFor(4000)
  await page.screenshot({ path: 'tmp/maps-in.png' })
  console.log('Welcome to Paris!')
  await browser.close()
}
testGoogleMaps()
//--------------
//  🐊
