// useful examples: https://stackoverflow.com/questions/22184747/parse-string-to-date-with-moment-js
const puppeteer = require('puppeteer')
const moment = require('moment')

async function momentJs() {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  moment.locale('hu')
  let testStr = 'Kedd 2019.01.08.'
  testStr = testStr.replace(/(\.)$/g, '').replace(/(\.)/g, '-')
  let testDate = moment(testStr, 'YYYY-MM-DD').format('LLL')
  console.log(testStr + ' --> ' + testDate)
  console.log(moment().format('LL'))

  await page.goto('http://chagallcafe.hu/?page_id=396', { waitUntil: 'networkidle0', timeout: 0 })
  const numberOfDaysOpened = (await page.$$('.menu-list__title')).length
  console.log('Days opened this week: ' + numberOfDaysOpened + '\n')
  for (let i = 0; i < numberOfDaysOpened; i++) {
    const daySelector = (await page.$$('.menu-list__title'))[i]
    let dayTextContent = await page.evaluate(el => el.textContent, daySelector)
    dayTextContent = dayTextContent.replace(/(\.)$/g, '').replace(/(\.)/g, '-')
    console.log('#' + (i + 1) + ' ' + dayTextContent)
    const dayTextDate = moment(dayTextContent, 'YYYY-MM-DD').add(0, 'days').format('LL')
    console.log(dayTextDate + '\n')
  }

  browser.close()
}
momentJs()
