const puppeteer = require('puppeteer')
async function testGoogleMaps() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 20 })
  const page = await browser.newPage()

  await page.goto('https://maps.google.com', { waitUntil: 'networkidle0', timeout: 0 })

  await page.screenshot({ path: 'tmp/maps.png' })
  await browser.close()
}
testGoogleMaps()
