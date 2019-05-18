const puppeteer = require('puppeteer')
const expect = require('expect')

async function testFlightRp() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 20 })
  const page = await browser.newPage()
  const navigationPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 })
  await page.setViewport({ width: 1024, height: 768 })

  /*
   * selectors liligo
   */
  const resultDetailsButton = '.travel-details-button'
  const cta = '.cta'
  const price = 'div.booking > div.price'
  const outboundDep = 'div.outbound > div.timing > div.from > div.time'
  const outboundArr = 'div.outbound > div.timing > div.to > div.time'
  const inboundDep = 'div.return > div.timing > div.from > div.time'
  const inboundArr = 'div.return > div.timing > div.to > div.time'
  const outboundDuration = 'div.outbound > div.timing > div.center > div.duration'
  const inboundDuration = 'div.return > div.timing > div.center > div.duration'
  /*
   * selectors other
   */
  const priceOther = 'tr.flexifare__price-row > td:nth-child(3) > span.flexifare__th'
  const outboundDepOther =
    'div:nth-child(1) > div.jcw-way-view__details-container > div > div.jcw-way-view__departure-container > div > div.jcw-way-view__departure-time'
  const outboundArrOther =
    'div:nth-child(1) > div.jcw-way-view__details-container > div > div.jcw-way-view__arrival-container > div > div.jcw-way-view__arrival-time'
  const inboundDepOther =
    'div:nth-child(2) > div.jcw-way-view__details-container > div > div.jcw-way-view__departure-container > div > div.jcw-way-view__departure-time'
  const inboundArrOther =
    'div:nth-child(2) > div.jcw-way-view__details-container > div > div.jcw-way-view__arrival-container > div > div.jcw-way-view__arrival-time'
  const outboundDurationOther = 'div:nth-child(1) > div.jcw-way-view__duration-container.hidden-xs.hidden-sm > div'
  const inboundDurationOther = 'div:nth-child(2) > div.jcw-way-view__duration-container.hidden-xs.hidden-sm > div'
  /*
   * parameters
   */
  let environment = 'https://' // https://, https://admin.
  let marketBaseUrl = 'flights-results.liligo.fr' // flights-results. --> FR, US
  let fromLocation = 'PAR'
  let toLocation = 'NYC'
  // departure date
  let depYear = '2019'
  let depMonth = '4'
  let depDay = '16'
  // return date
  let retYear = '2019'
  let retMonth = '4'
  let retDay = '28'
  // passengers
  let adults = '1'
  let children = '0'
  let infants = '0'

  let tripType = 'roundTrip' // roundTrip, oneWay
  let airClass = 'EC' // _EC, PC, BC, FC
  let rpFilter = 'LAS'

  let urlStructure =
    environment +
    marketBaseUrl +
    '/air/SearchFlights.jsp' +
    '?roundTrip=' +
    tripType +
    '&fromLocation=' +
    fromLocation +
    '&toLocation=' +
    toLocation +
    '&depYear=' +
    depYear +
    '&depMonth=' +
    depMonth +
    '&depDay=' +
    depDay +
    '&retYear=' +
    retYear +
    '&retMonth=' +
    retMonth +
    '&retDay=' +
    retDay +
    '&adults=' +
    adults +
    '&children=' +
    children +
    '&infants=' +
    infants +
    '&class=' +
    airClass +
    '&includeNearbyAirports=on' +
    '&air-to-nearby=on' +
    '&rpFilter=' +
    rpFilter

  await page.goto(urlStructure, { waitUntil: 'domcontentloaded', timeout: 0 })
  await page.waitForSelector(resultDetailsButton)
  await page.waitForSelector('div.simplepagination-filter')
  // await page.waitFor(30000)
  await page.click(resultDetailsButton)[0]

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
    fromLocation +
      '-' +
      toLocation +
      ' ' +
      depYear +
      '/' +
      depMonth +
      '/' +
      depDay +
      '-' +
      retYear +
      '/' +
      retMonth +
      '/' +
      retDay +
      ', ' +
      tripType +
      ', ' +
      airClass +
      ' | ' +
      rpFilter +
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

  await navigationPromise
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
  await page.waitFor(5000)
  const pageList = await browser.pages()
  await pageList[2].focus()

  await page.waitForSelector('div.passengers > form > div > div.panel-body') // wait till data presents
  // [1.] stores all the other site's
  const outboundDepFirstOther = (await page.$$(outboundDepOther))[0]
  let outboundDepFirstContentOther = await page.evaluate(el => el.textContent, outboundDepFirstOther)
  const outboundArrFirstOther = (await page.$$(outboundArrOther))[0]
  let outboundArrFirstContentOther = await page.evaluate(el => el.textContent, outboundArrFirstOther)
  const inboundDepFirstOther = (await page.$$(inboundDepOther))[0]
  let inboundDepFirstContentOther = await page.evaluate(el => el.textContent, inboundDepFirstOther)
  const inboundArrFirstOther = (await page.$$(inboundArrOther))[0]
  let inboundArrFirstContentOther = await page.evaluate(el => el.textContent, inboundArrFirstOther)
  const outboundDurationFirstOther = (await page.$$(outboundDurationOther))[0]
  let outboundDurationFirstContentOther = await page.evaluate(el => el.textContent, outboundDurationFirstOther)
  const inboundDurationFirstOther = (await page.$$(inboundDurationOther))[0]
  let inboundDurationFirstContentOther = await page.evaluate(el => el.textContent, inboundDurationFirstOther)
  const priceFirstOther = (await page.$$(priceOther))[0]
  let priceFirstContentOther = await page.evaluate(el => el.textContent, priceFirstOther)
  console.log(
    outboundDepFirstContentOther +
      outboundArrFirstContentOther +
      inboundDepFirstContentOther +
      inboundArrFirstContentOther +
      outboundDurationFirstContentOther +
      inboundDurationFirstContentOther +
      priceFirstContentOther
  )

  expect(outboundDepFirstOther).toBe(outboundDepFirst)

  await browser.close()
}
testFlightRp()
