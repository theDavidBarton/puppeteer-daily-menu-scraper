jest.setTimeout(30000)

const puppeteer = require('puppeteer')
// const puppeteerFirefox = require('puppeteer-firefox')

let browser, page

beforeAll(async function() {
  browser = await puppeteer.launch({ headless: false, slowMo: 20 })
  page = await browser.newPage()
  await page.setViewport({ width: 1024, height: 768 })
})

/*
 * -----------------------------------
 * TEST VALUES
 * -----------------------------------
 */

const urlHomepage = 'http://www.liligo.fr/'
const homePageTitlePart = 'LILIGO.com'
// const flightRedirectPageTitlePart = 'liligo.com'
const flightFromTypeLetters = 'San f'
const flightToTypeLetters = 'Par'
const flightFromContentToBe = 'San Francisco,  CA, Etats-Unis (SFO)'
const flightToContentToBe = 'Paris, France (CDG)'

/*
 * -----------------------------------
 * SELECTORS
 * -----------------------------------
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
// => const datePickerMonth2 = 'div.dpMonth.dpMonth2 .dpMonthHeader'
const datePickerArrowRight = '.dpNext'
const randomFutureDate = 'tr:nth-child(3) > td:nth-child(4)'

const clickoutHome = '.hp-searcharea' // the searchform's background on homepage or v6
const clickoutSeo = '.sc-searchform' // the searchform's background on SEO (sc)

const departureHeaderSelectorInside = '.results-header-city'
const arrivalHeaderSelectorInside = '.results-header-city'
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

let flightFromContentArray = []
let flightToContentArray = []

describe('Liligo Flight search', function() {
  test('GIVEN I am on the homepage of liligo', async function() {
    await page.goto(urlHomepage, { waitUntil: 'domcontentloaded', timeout: 0 }) // for Firefox: remove "{ waitUntil: '...', timeout: x }"
  })

  /*
   * -----------------------------------
   * LOCATIONS
   * -----------------------------------
   */

  test('AND page title contains' + homePageTitlePart, async function() {
    let homePageTitle = await page.title()
    expect(homePageTitle).toContain(homePageTitlePart)
  })

  test('WHEN I set departure with mouse to ' + flightFromContentToBe, async function() {
    await page.waitForSelector(flightFrom)
    await page.click(flightFrom)
    await page.keyboard.type(flightFromTypeLetters)
    await page.waitFor(1000) // make sure dropdown opens
    await page.waitForSelector(complocFirst)
    await page.click(complocFirst)
    let flightFromContent = await page.evaluate(el => el.value, await page.$(flightFrom))
    /*
     * prepare arrays from route location elements for result page validation
     * expected format: [ 'San Francisco', ' CA', 'Etats-Unis (SFO)' ]
     */
    flightFromContentArray = flightFromContent.split(', ')
    expect(flightFromContent).toBe(flightFromContentToBe)
  })

  test('AND I set destination by keyboard to ' + flightToContentToBe, async function() {
    await page.keyboard.type(flightToTypeLetters)
    await page.waitFor(1000)
    await page.waitForSelector(complocSecond)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    let flightToContent = await page.evaluate(el => el.value, await page.$(flightTo))
    /*
     * prepare arrays from route location elements for result page validation
     * expected format: [ 'San Francisco', ' CA', 'Etats-Unis (SFO)' ]
     */
    flightToContentArray = flightToContent.split(', ')
    expect(flightToContent).toBe(flightToContentToBe)
  })

  /*
   * -----------------------------------
   * DATE PICKER
   * -----------------------------------
   */

  test('AND default departure date is evaluated', async function() {
    await page.waitForSelector(flightDepartureDate)
    let flightDepartureDateContent = await page.evaluate(el => el.innerText, await page.$(flightDepartureDate))
    console.log(flightDepartureDateContent)
  })

  test('AND default return date  is evaluated', async function() {
    await page.waitForSelector(flightReturnDate)
    let flightReturnDateContent = await page.evaluate(el => el.innerText, await page.$(flightReturnDate))
    console.log(flightReturnDateContent)
  })

  test('AND I select departure date', async function() {
    await page.click(flightDepartureDate)
    await page.waitForSelector(datePickerArrowRight)
    await page.click(datePickerArrowRight)
    await page.click(randomFutureDate)
    flightDepartureDateContent = await page.evaluate(el => el.innerText, await page.$(flightDepartureDate)) // format: 18 Avr. 2019 (jeudi)
    flightReturnDateContent = await page.evaluate(el => el.innerText, await page.$(flightReturnDate)) // format: 25 Avr. 2019 (jeudi)
  })

  test('AND departure day is valid', async function() {
    await page.click(flightDepartureDate)
    let flightDepartureDateSelectedMonth = await page.evaluate(el => el.innerText, await page.$(datePickerMonth1))
    let flightDepartureDateSelectedDay = await page.evaluate(el => el.innerText, await page.$(actualDate))
    let flightDepartureDateSelected = flightDepartureDateSelectedDay + ' ' + flightDepartureDateSelectedMonth // format: 18 Avril, 2019

    let flightDepartureDateContentArray = flightDepartureDateSelected.split(' ')
    console.log(flightDepartureDateContentArray)
    console.log('   ----> departure day selected by me: ' + flightDepartureDateSelected)
    expect(flightDepartureDateContentArray).toContain(flightDepartureDateSelectedDay)
    console.log('        √ departure field contains the selected day: ' + flightDepartureDateSelectedDay)
  })

  test('AND return day is valid', async function() {
    await page.click(flightReturnDate)
    let flightReturnDateSelectedMonth = await page.evaluate(el => el.innerText, await page.$(datePickerMonth1))
    let flightReturnDateSelectedDay = await page.evaluate(el => el.innerText, await page.$(actualDate))
    let flightReturnDateSelected = flightReturnDateSelectedDay + ' ' + flightReturnDateSelectedMonth // format: 25 Avril, 2019

    let flightReturnDateContentArray = flightReturnDateSelected.split(' ')
    console.log(flightReturnDateContentArray)
    console.log('    ----> return day selected by me: ' + flightReturnDateSelected)
    expect(flightReturnDateContentArray).toContain(flightReturnDateSelectedDay)
    console.log('        √ destination field contains the selected day: ' + flightReturnDateSelectedDay)
  })

  /*
   * -----------------------------------
   * CLICKOUT (promise.race)
   * -----------------------------------
   */

  test('AND I clickout from searchform', async function() {
    await Promise.race([page.waitForSelector(clickoutHome), page.waitForSelector(clickoutSeo)])
    if ((await page.$(clickoutHome)) !== null) {
      await page.click(clickoutHome)
    } else {
      await page.click(clickoutSeo)
    }
  })

  test('AND I deselect comparesites', async function() {
    await page.waitForSelector(deselectComparesite)
    await page.click(deselectComparesite)
  })

  test('AND I launch search', async function() {
    await page.waitForSelector(flightSubmit)
    await page.click(flightSubmit)
  })

  /*
   * -----------------------------------
   * RESULT PAGE
   * -----------------------------------
   */

  test('THEN resultpage appears', async function() {
    await page.waitForSelector(resultDetailsButton)
  })

  test('AND departure location from result header matches location from the homepage', async function() {
    const departureHeaderSelector = (await page.$$(departureHeaderSelectorInside))[0]
    let departureHeaderContent = await page.evaluate(el => el.textContent, departureHeaderSelector)
    expect(departureHeaderContent).toBe(flightFromContentArray[0])
  })

  test('AND arrival location from result header matches location from the homepage', async function() {
    const arrivalHeaderSelector = (await page.$$(arrivalHeaderSelectorInside))[1]
    let arrivalHeaderContent = await page.evaluate(el => el.textContent, arrivalHeaderSelector)
    expect(arrivalHeaderContent).toBe(flightToContentArray[0])
  })

  test('WHEN I click on 1st result details', async function() {
    await page.click(resultDetailsButton)[0]
  })

  test('THEN 1st result details appear', async function() {
    // [1.] stores all the first result's data to be compared
    const outboundDepFirst = (await page.$$(outboundDep))[0]
    const outboundArrFirst = (await page.$$(outboundArr))[0]
    const inboundDepFirst = (await page.$$(inboundDep))[0]
    const inboundArrFirst = (await page.$$(inboundArr))[0]
    const outboundDurationFirst = (await page.$$(outboundDuration))[0]
    const inboundDurationFirst = (await page.$$(inboundDuration))[0]
    const priceFirst = (await page.$$(price))[0]

    let outboundDepFirstContent = await page.evaluate(el => el.textContent, outboundDepFirst)
    let outboundArrFirstContent = await page.evaluate(el => el.textContent, outboundArrFirst)
    let inboundDepFirstContent = await page.evaluate(el => el.textContent, inboundDepFirst)
    let inboundArrFirstContent = await page.evaluate(el => el.textContent, inboundArrFirst)
    let outboundDurationFirstContent = await page.evaluate(el => el.textContent, outboundDurationFirst)
    let inboundDurationFirstContent = await page.evaluate(el => el.textContent, inboundDurationFirst)
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
  })

  test('WHEN I click on 3rd result details', async function() {
    await page.click(resultDetailsButton)[2]
  })

  test('THEN 3rd result details appear', async function() {
    // [3.] stores all the third result's data to be compared
    const outboundDepThird = (await page.$$(outboundDep))[2]
    const outboundArrThird = (await page.$$(outboundArr))[2]
    const inboundDepThird = (await page.$$(inboundDep))[2]
    const inboundArrThird = (await page.$$(inboundArr))[2]
    const outboundDurationThird = (await page.$$(outboundDuration))[2]
    const inboundDurationThird = (await page.$$(inboundDuration))[2]
    const priceThird = (await page.$$(price))[2]

    let outboundDepThirdContent = await page.evaluate(el => el.textContent, outboundDepThird)
    let outboundArrThirdContent = await page.evaluate(el => el.textContent, outboundArrThird)
    let inboundDepThirdContent = await page.evaluate(el => el.textContent, inboundDepThird)
    let inboundArrThirdContent = await page.evaluate(el => el.textContent, inboundArrThird)
    let outboundDurationThirdContent = await page.evaluate(el => el.textContent, outboundDurationThird)
    let inboundDurationThirdContent = await page.evaluate(el => el.textContent, inboundDurationThird)
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
  })

  test('WHEN search ends I click on an offer', async function() {
    await page.waitForSelector(simplePagination)
    await page.click(cta)[0]
  })

  /*
   * -----------------------------------
   * REDIRECT PAGE
   * -----------------------------------
   */

  test('THEN I see a redirection to partner\'s site', async function() {
    await page.waitFor(1000)
    // let redirectPageTitle = await page.title()
  })

  test('AND I close the new tab', async function() {
    await page.waitFor(1000)
    const pageList = await browser.pages()
    await pageList[2].close()
    await page.bringToFront()
  })

  afterAll(async function() {
    await browser.close()
  })
})
