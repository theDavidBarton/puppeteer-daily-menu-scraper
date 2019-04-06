const puppeteer = require('puppeteer')
async function testGoogleMaps() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 20 })
  const page = await browser.newPage()

  await page.goto('https://www.google.com/maps?hl=en', { waitUntil: 'networkidle0', timeout: 0 })
  await page.waitForSelector('#minimap > div > div.widget-minimap > button')
  await page.click('#minimap > div > div.widget-minimap > button')
  for (let i = 0; i < 15; i++) {
    page.evaluate('window.scrollBy(0, 15);')
  }
  await page.waitFor(3000)
  await page.screenshot({ path: 'tmp/maps.png' })
  await browser.close()
}
testGoogleMaps()
