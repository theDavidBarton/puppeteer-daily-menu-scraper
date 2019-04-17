const puppeteer = require('puppeteer')
const moment = require('moment')

async function momentJs() {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto('https://google.com', { waitUntil: 'networkidle0', timeout: 0 })
  moment.locale('hu')
  let testDate = moment('2019. ÁPRILIS 17. 16:26', 'YYYY MMM DD').format('LLLL')
  moment.locale('en')
  console.log(testDate)
  console.log(moment().format('LL'))
  browser.close()
}
momentJs()
