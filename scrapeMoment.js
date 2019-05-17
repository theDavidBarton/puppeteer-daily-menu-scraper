// useful examples: https://stackoverflow.com/questions/22184747/parse-string-to-date-with-moment-js
const puppeteer = require('puppeteer')
const moment = require('moment')

// get Day of Week
const today = Number(moment().format('d'))
const now = moment()
const todayFormatted = moment().format('LLLL')
const todayDotSeparated = moment('2018-01-11', 'YYYY-MM-DD')
  .locale('hu')
  .format('L')
const todayMinusOne = moment(todayFormatted, 'LLLL')
  .subtract(1, 'day')
  .format('LLLL')
const dayNames = []
for (let i = 0; i < 7; i++) {
  let day = moment(i, 'd').format('dddd')
  dayNames.push(day)
}
console.log('ezt skubizd hapsikám: ' + todayDotSeparated)

async function momentJs() {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  // general checking if menu is up-to-date
  async function checkDateForWeekly(selectTheWhole) {
    let selector = selectTheWhole
    let found = false
    const theWhole = await page.evaluate(el => el.textContent, selectTheWhole)
    let actualDateStrings = theWhole.match(/([12]\d{3}.(0[1-9]|1[0-2]).(0[1-9]|[12]\d|3[01]))/gm)
    console.log(actualDateStrings)
    for (let i = 0; i < actualDateStrings.length; i++) {
      actualDateStrings[i] = moment(actualDateStrings[i], 'YYYY-MM-DD')
        .locale('hu')
        .format('L')
      if (actualDateStrings[i].match(todayDotSeparated)) {
        console.log(actualDateStrings[i] + i + ' matches today! ' + todayDotSeparated)
        found = true
      }
    }
    if (found === false) {
      console.log('no luck buddy!')
    } else {
      console.log('this is your lucky day')
    }
  }

  moment.locale('hu')
  let testStr = 'Kedd 2019.01.08.'
  testStr = testStr.replace(/(\.)$/g, '').replace(/(\.)/g, '-')
  let testDate = moment(testStr, 'YYYY-MM-DD').format('LLL')
  console.log(testStr + ' --> ' + testDate)
  console.log(moment().format('LL'))

  await page.goto('http://chagallcafe.hu/?page_id=396', { waitUntil: 'networkidle0', timeout: 0 })
  const numberOfDaysOpened = (await page.$$('.menu-list__title')).length
  console.log('Days opened this week: ' + numberOfDaysOpened + '\n')

  await checkDateForWeekly((await page.$$('.page__content'))[0])

  for (let i = 0; i < numberOfDaysOpened; i++) {
    const daySelector = (await page.$$('.menu-list__title'))[i]
    let dayTextContent = await page.evaluate(el => el.textContent, daySelector)
    dayTextContent = dayTextContent.replace(/(\.)$/g, '').replace(/(\.)/g, '-')
    console.log('#' + (i + 1) + ' ' + dayTextContent)
    const dayTextDate = moment(dayTextContent, 'YYYY-MM-DD')
      .add(0, 'days')
      .format('L')
    console.log(dayTextDate + '\n')
  }

  browser.close()
}
momentJs()
