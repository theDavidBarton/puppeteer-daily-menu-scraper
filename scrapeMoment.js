const puppeteer = require('puppeteer')
const moment = require('moment')

async function momentJs() {
  const browser = puppeteer.launch({ headless: false, slowMo: 20 })
  const page = browser.newPage()
  await page.goto('https://google.com', { waitUntil: 'networkidle0', timeout: 0 })

  browser.close()
}
momentJs()
