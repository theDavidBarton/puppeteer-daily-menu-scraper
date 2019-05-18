// useful examples: https://stackoverflow.com/questions/22184747/parse-string-to-date-with-moment-js
const puppeteer = require('puppeteer')
const moment = require('moment')

// get Day of Week
// const today = Number(moment().format('d'))
const now = moment()
const todayFormatted = moment().format('LLLL')
const todayDotSeparated = moment('2019-05-17', 'YYYY-MM-DD')
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
console.log('dotsep: ' + todayDotSeparated)

async function momentJs() {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  // general checking if menu is up-to-date
  let found
  async function checkDateForWeekly(selectTheWhole, dateRegex) {
    // const theWhole = await page.evaluate(el => el.textContent, selectTheWhole)
    const theWhole = '2019. 05. 13.  - HÉTFÕMiso leves  tengergyümölcseivelSushi: Füstölt tofu nigiri, lazac makiPad prik kaeng csirkeSzójababcsíra salátaMochi2019. 05. 14. - KEDDThai curry leves  csirkévelSushi: polip nigiri, tamago nigiri, avokádó gunkanTon katsu szezámos rizzselKáposzta salátaMatcha sajttorta2019. 05. 15. - SZERDASukiyaki leves  csirkévelSushi, maki: hátszín retekcsíraÁzsiai bbq oldalas tojásos rizzselKaktugiRopogós tortilla mangó öntettel2019. 05. 16. - CSÜTÖRTÖKMiso levesSushi, maki:  Vöröstonhal, enoki gombaBio algás pad thai  tészta, marhahátszínnelOi kimchiBelga csokoládé  torta2019. 05. 17. - PÉNTEKRamen leves fõtt  császárralLazac donburiPhuket marha, szezámos rizzselKimchiMandulás túrógolyó'
    let actualDateStrings = theWhole.match(dateRegex)
    found = false
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
    return found
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

  await checkDateForWeekly((await page.$$('.page__content'))[0], /([12]\d{3}. (0[1-9]|1[0-2]). (0[1-9]|[12]\d|3[01]))/gm)
console.log(found)
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
