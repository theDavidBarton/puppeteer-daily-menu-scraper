const puppeteer = require('puppeteer')
// const puppeteerFirefox = require('puppeteer-firefox')
const expect = require('expect')

async function testFlight() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 20 })
  const page = await browser.newPage()
  const navigationPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 })
  // Firefox: remove "{ waitUntil: 'networkidle2', timeout: 0 }"
  await page.setViewport({ width: 1024, height: 768 })
  console.log('... puppeteer has launched')

  /*
   -----------------------------------
   TEST VALUES
   -----------------------------------
  */

  const urlHomepage = 'http://www.liligo.fr/'
  const homePageTitlePart = 'LILIGO.com'
  const flightRedirectPageTitlePart = 'liligo.com'
  const flightFromTypeLetters = 'San f'
  const flightToTypeLetters = 'Par'
  const flightFromContentToBe = 'San Francisco,  CA, Etats-Unis (SFO)'
  const flightToContentToBe = 'Paris, France (CDG)'

  /*
   -----------------------------------
   SELECTORS
   -----------------------------------
  */

  const flightFrom = '#air-from'
  const flightTo = '#air-to'
  const complocFirst = '#liligo_cl2_item_0'
  const complocSecond = '#liligo_cl2_item_1'
  const flightDepartureDate = '#air-out-date-value'
  const flightReturnDate = '#air-ret-date-value'
  const deselectComparesite = '.hp-searchform-comparesite-selectnone'
  const flightSubmit = '#air-submit'

  const actualDate = '.actual'
  const datePickerMonth1 = 'div.dpMonth.dpMonth1 .dpMonthHeader'
  // const datePickerMonth2 = 'div.dpMonth.dpMonth2 .dpMonthHeader'
  const datePickerArrowRight = '.dpNext'
  const randomFutureDate = 'tr:nth-child(3) > td:nth-child(4)'

  const clickoutHome = '.hp-searcharea' // the searchform's background on homepage or v6
  const clickoutSeo = '.sc-searchform' // the searchform's background on SEO (sc)

  const simplePagination = 'div.simplepagination-filter'
  const price = 'div.booking > div.price'
  const outboundDep = 'div.outbound > div.timing > div.from > div.time'
  const outboundArr = 'div.outbound > div.timing > div.to > div.time'
  const inboundDep = 'div.return > div.timing > div.from > div.time'
  const inboundArr = 'div.return > div.timing > div.to > div.time'
  const outboundDuration = 'div.outbound > div.timing > div.center > div.duration'
  const inboundDuration = 'div.return > div.timing > div.center > div.duration'
  const resultDetailsButton = '.travel-details-button'
  const cta = '.cta'

  await page.goto(urlHomepage, { waitUntil: 'domcontentloaded', timeout: 0 }) // Firefox: remove "{ waitUntil: 'networkidle2', timeout: 0 }"

  /*
   -----------------------------------
   LOCATIONS
   -----------------------------------
  */

  let homePageTitle = await page.title()
  expect(homePageTitle).toContain(homePageTitlePart)
  console.log(homePageTitle + ' contains: ' + homePageTitlePart)

  console.log('√ GIVEN I am on the homepage of ' + urlHomepage)

  await page.waitForSelector(flightFrom)
  await page.click(flightFrom)
  await page.keyboard.type(flightFromTypeLetters)
  await page.waitFor(1000) // make sure dropdown opens
  await page.waitForSelector(complocFirst)
  await page.click(complocFirst)
  let flightFromContent = await page.evaluate(el => el.value, await page.$(flightFrom))
  expect(flightFromContent).toBe(flightFromContentToBe)

  console.log('√ WHEN I set departure with mouse to ' + flightFromContent)

  await page.keyboard.type(flightToTypeLetters)
  await page.waitFor(1000)
  await page.waitForSelector(complocSecond)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  // await page.click(complocSecond)
  let flightToContent = await page.evaluate(el => el.value, await page.$(flightTo))
  expect(flightToContent).toBe(flightToContentToBe)

  console.log('√ AND I set destination by keyboard to ' + flightToContent)

  // prepare arrays from route location elements for result page validation
  // expected format: [ 'San Francisco', ' CA', 'Etats-Unis (SFO)' ]
  let flightFromContentArray = flightFromContent.split(', ')
  let flightToContentArray = flightToContent.split(', ')
  /*
   -----------------------------------
   DATE PICKER
   -----------------------------------
  */

  await page.waitForSelector(flightDepartureDate)
  let flightDepartureDateContent = await page.evaluate(el => el.innerText, await page.$(flightDepartureDate))
  await page.waitForSelector(flightReturnDate)
  let flightReturnDateContent = await page.evaluate(el => el.innerText, await page.$(flightReturnDate))

  console.log('√ AND default departure date is: ' + flightDepartureDateContent)
  console.log('√ AND default return date is: ' + flightReturnDateContent)

  await page.click(flightDepartureDate)
  await page.waitForSelector(datePickerArrowRight)
  await page.click(datePickerArrowRight)
  await page.click(randomFutureDate)
  flightDepartureDateContent = await page.evaluate(el => el.innerText, await page.$(flightDepartureDate)) // format: 18 Avr. 2019 (jeudi)
  flightReturnDateContent = await page.evaluate(el => el.innerText, await page.$(flightReturnDate)) // format: 25 Avr. 2019 (jeudi)

  console.log('√ AND I select departure date: ' + flightDepartureDateContent)
  console.log('√ THEN selected return date is: ' + flightReturnDateContent)

  // validates date selection
  await page.click(flightDepartureDate)
  let flightDepartureDateSelectedMonth = await page.evaluate(el => el.innerText, await page.$(datePickerMonth1))
  let flightDepartureDateSelectedDay = await page.evaluate(el => el.innerText, await page.$(actualDate))
  let flightDepartureDateSelected = flightDepartureDateSelectedDay + ' ' + flightDepartureDateSelectedMonth // format: 18 Avril, 2019

  let flightDepartureDateContentArray = flightDepartureDateSelected.split(' ')
  console.log(flightDepartureDateContentArray)

  console.log('   ----> departure day selected by me: ' + flightDepartureDateSelected)

  expect(flightDepartureDateContentArray).toContain(flightDepartureDateSelectedDay)

  console.log('        √ departure field contains the selected day: ' + flightDepartureDateSelectedDay)

  await page.click(flightReturnDate)
  let flightReturnDateSelectedMonth = await page.evaluate(el => el.innerText, await page.$(datePickerMonth1))
  let flightReturnDateSelectedDay = await page.evaluate(el => el.innerText, await page.$(actualDate))
  let flightReturnDateSelected = flightReturnDateSelectedDay + ' ' + flightReturnDateSelectedMonth // format: 25 Avril, 2019

  let flightReturnDateContentArray = flightReturnDateSelected.split(' ')
  console.log(flightReturnDateContentArray)

  console.log('    ----> return day selected by me: ' + flightReturnDateSelected)

  expect(flightReturnDateContentArray).toContain(flightReturnDateSelectedDay)

  console.log('        √ destination field contains the selected day: ' + flightReturnDateSelectedDay)

  /*
   -----------------------------------
   CLICKOUT (promise.race)
   -----------------------------------
  */

  await Promise.race([page.waitForSelector(clickoutHome), page.waitForSelector(clickoutSeo)])

  if ((await page.$(clickoutHome)) !== null) {
    await page.click(clickoutHome)

    console.log('√ AND I clickout from homepage searchform')
  } else {
    await page.click(clickoutSeo)

    console.log('√ AND I clickout from seo searchform')
  }

  await page.waitForSelector(deselectComparesite)
  await page.click(deselectComparesite)

  console.log('√ WHEN I deselect comparesites')

  await page.waitForSelector(flightSubmit)
  await page.click(flightSubmit)

  console.log('√ AND I launch search')

  /*
   -----------------------------------
   RESULT PAGE
   -----------------------------------
  */

  await page.waitForSelector(resultDetailsButton)

  console.log('√ THEN resultpage appears')
  console.log('√ AND results appear')
  // source: https://github.com/GoogleChrome/puppeteer/issues/2859
  const departureHeaderSelector = (await page.$$('.results-header-city'))[0]
  const arrivalHeaderSelector = (await page.$$('.results-header-city'))[1]
  let departureHeaderContent = await page.evaluate(el => el.textContent, departureHeaderSelector)
  let arrivalHeaderContent = await page.evaluate(el => el.textContent, arrivalHeaderSelector)
  expect(departureHeaderContent).toBe(flightFromContentArray[0])

  console.log('√ AND departure: ' + departureHeaderContent + ' from result header matches ' + flightFromContentArray[0] + ' from homepage')
  expect(arrivalHeaderContent).toBe(flightToContentArray[0])

  console.log('√ AND destination: ' + arrivalHeaderContent + ' from result header matches ' + flightToContentArray[0] + ' from homepage')

  await navigationPromise
  // make sure search finished
  await page.waitForSelector(simplePagination)

  console.log('√ WHEN I click on result details')
  await page.click(resultDetailsButton)[0]

  console.log('√ THEN result details appear')

  // [1.] stores all the first result's data to be compared
  const outboundDepFirst = (await page.$$(outboundDep))[0]
  let outboundDepFirstContent = await page.evaluate(el => el.textContent, outboundDepFirst)
  const outboundArrFirst = (await page.$$(outboundArr))[0]
  let outboundArrFirstContent = await page.evaluate(el => el.textContent, outboundArrFirst)
  const inboundDepFirst = (await page.$$(inboundDep))[0]
  let inboundDepFirstContent = await page.evaluate(el => el.textContent, inboundDepFirst)
  const inboundArrFirst = (await page.$$(inboundArr))[0]
  let inboundArrFirstContent = await page.evaluate(el => el.textContent, inboundArrFirst)
  const outboundDurationFirst = (await page.$$(outboundDuration))[0]
  let outboundDurationFirstContent = await page.evaluate(el => el.textContent, outboundDurationFirst)
  const inboundDurationFirst = (await page.$$(inboundDuration))[0]
  let inboundDurationFirstContent = await page.evaluate(el => el.textContent, inboundDurationFirst)
  const priceFirst = (await page.$$(price))[0]
  let priceFirstContent = await page.evaluate(el => el.textContent, priceFirst)

  console.log(
    '\nFirst result: ' +
      '\nOUTBOUND: ' +
      outboundDepFirstContent +
      '->' +
      outboundArrFirstContent +
      ' (' +
      outboundDurationFirstContent +
      ') ' +
      'INBOUND: ' +
      inboundDepFirstContent +
      '->' +
      inboundArrFirstContent +
      ' (' +
      inboundDurationFirstContent +
      ') PRICE: ' +
      priceFirstContent +
      '\n'
  )

  await page.screenshot({ path: 'tmp/screenshot01.png' })

  await page.click(resultDetailsButton)[2]

  // [3.] stores all the third result's data to be compared
  const outboundDepThird = (await page.$$(outboundDep))[2]
  let outboundDepThirdContent = await page.evaluate(el => el.textContent, outboundDepThird)
  const outboundArrThird = (await page.$$(outboundArr))[2]
  let outboundArrThirdContent = await page.evaluate(el => el.textContent, outboundArrThird)
  const inboundDepThird = (await page.$$(inboundDep))[2]
  let inboundDepThirdContent = await page.evaluate(el => el.textContent, inboundDepThird)
  const inboundArrThird = (await page.$$(inboundArr))[2]
  let inboundArrThirdContent = await page.evaluate(el => el.textContent, inboundArrThird)
  const outboundDurationThird = (await page.$$(outboundDuration))[2]
  let outboundDurationThirdContent = await page.evaluate(el => el.textContent, outboundDurationThird)
  const inboundDurationThird = (await page.$$(inboundDuration))[2]
  let inboundDurationThirdContent = await page.evaluate(el => el.textContent, inboundDurationThird)
  const priceThird = (await page.$$(price))[2]
  let priceThirdContent = await page.evaluate(el => el.textContent, priceThird)

  console.log(
    '\nThird result: ' +
      '\nOUTBOUND: ' +
      outboundDepThirdContent +
      '->' +
      outboundArrThirdContent +
      ' (' +
      outboundDurationThirdContent +
      ') ' +
      'INBOUND: ' +
      inboundDepThirdContent +
      '->' +
      inboundArrThirdContent +
      ' (' +
      inboundDurationThirdContent +
      ') PRICE: ' +
      priceThirdContent +
      '\n'
  )
  await page.screenshot({ path: 'tmp/screenshot02.png' })

  await page.click(cta)[0]
  /*
  -----------------------------------
  REDIRECT PAGE
  -----------------------------------
  */

  console.log('√ WHEN I click on an offer')

  await page.waitFor(1000)
  let redirectPageTitle = await page.title()
  // this part needs more work to store the new tab's title instead of the initial tab's title
  // expect(redirectPageTitle).toContain(flightRedirectPageTitlePart)
  console.log(redirectPageTitle + ' contains: ' + flightRedirectPageTitlePart)

  console.log("√ THEN I see a redirection to partner's site")
  await page.waitFor(1000) // sorry about this one we need a better structure here to avoid failing tab closes
  const pageList = await browser.pages()
  console.log('- NUMBER TABS:', pageList.length)
  await pageList[2].close()
  await page.bringToFront()

  await browser.close()
}
testFlight()
