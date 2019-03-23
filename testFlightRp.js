const puppeteer = require('puppeteer')
const expect = require('expect')

async function testFlightRp () {
  const browser = await puppeteer.launch({ headless: false, slowMo: 20 })
  const page = await browser.newPage()
  const navigationPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 })
  await page.setViewport({ width: 1024, height: 768 })

  /*
  SELECTORS LILIGO
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
  PARAMETERS
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
  let airClass = 'EC' // EC, PC, BC, FC
  let rpFilter = 'MAPI'

  let urlStructure = environment + marketBaseUrl +
    '/air/SearchFlights.jsp' +
    '?roundTrip=' + tripType +
    '&fromLocation=' + fromLocation +
    '&toLocation=' + toLocation +
    '&depYear=' + depYear +
    '&depMonth=' + depMonth +
    '&depDay=' + depDay +
    '&retYear=' + retYear +
    '&retMonth=' + retMonth +
    '&retDay=' + retDay +
    '&adults=' + adults +
    '&children=' + children +
    '&infants=' + infants +
    '&class=' + airClass +
    '&includeNearbyAirports=on' +
    '&air-to-nearby=on' +
    '&rpFilter=' + rpFilter

  await page.goto(urlStructure, { waitUntil: 'domcontentloaded', timeout: 0 })
  console.log(urlStructure)
  await page.waitForSelector(resultDetailsButton)
  await page.click(resultDetailsButton)[0]

  // [1.] stores all the first result's data to be compared
  const outboundDepFirst = (await page.$$(outboundDep))[0]
  let outboundDepFirstContent = await page.evaluate(
    el => el.textContent, outboundDepFirst
  )
  const outboundArrFirst = (await page.$$(outboundArr))[0]
  let outboundArrFirstContent = await page.evaluate(
    el => el.textContent, outboundArrFirst
  )
  const inboundDepFirst = (await page.$$(inboundDep))[0]
  let inboundDepFirstContent = await page.evaluate(
    el => el.textContent, inboundDepFirst
  )
  const inboundArrFirst = (await page.$$(inboundArr))[0]
  let inboundArrFirstContent = await page.evaluate(
    el => el.textContent, inboundArrFirst
  )
  const outboundDurationFirst = (await page.$$(outboundDuration))[0]
  let outboundDurationFirstContent = await page.evaluate(
    el => el.textContent, outboundDurationFirst
  )
  const inboundDurationFirst = (await page.$$(inboundDuration))[0]
  let inboundDurationFirstContent = await page.evaluate(
    el => el.textContent, inboundDurationFirst
  )
  const priceFirst = (await page.$$(price))[0]
  let priceFirstContent = await page.evaluate(
    el => el.textContent, priceFirst
  )

  console.log('\nOUTBOUND: ' +
    outboundDepFirstContent + '->' +
    outboundArrFirstContent + ' (' +
    outboundDurationFirstContent + ') ' +
    'INBOUND: ' +
    inboundDepFirstContent + '->' +
    inboundArrFirstContent + ' (' +
    inboundDurationFirstContent + ') PRICE: ' +
    priceFirstContent + '\n')

  await navigationPromise
  await page.screenshot({ path: 'tmp/screenshot.png' })
  await page.click(cta)[0]
  await page.waitFor(1000)
  await browser.close()
}
testFlightRp()
