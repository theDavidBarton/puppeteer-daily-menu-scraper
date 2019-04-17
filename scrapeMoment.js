// useful examples: https://stackoverflow.com/questions/22184747/parse-string-to-date-with-moment-js
const puppeteer = require('puppeteer')
const moment = require('moment')

async function momentJs() {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto('https://google.com', { waitUntil: 'networkidle0', timeout: 0 })
  moment.locale('hu')
  let testDate = moment('2019. ÁPRILIS 17. 16:26', 'YYYY MMM DD').format('LLLL')
  console.log(testDate)
  console.log(moment().format('LL'))

  await page.goto('http://chagallcafe.hu/?page_id=396', { waitUntil: 'networkidle0', timeout: 0 })
  const numberOfDaysOpened = (await page.$$('.menu-list__title')).length
  console.log('Days opened this week: ' + numberOfDaysOpened + '\n')

  for (let i = 0; i < numberOfDaysOpened; i++) {
    const daySelector = (await page.$$('.menu-list__title'))[i]
    const dayTextContent = await page.evaluate(el => el.textContent, daySelector)
    console.log('#' + (i + 1) + ' ' + dayTextContent)
    const dayTextDate = moment(dayTextContent).add(7, 'days').format('LLLL')
    console.log(dayTextDate + '\n')
  }

  browser.close()
}
momentJs()
