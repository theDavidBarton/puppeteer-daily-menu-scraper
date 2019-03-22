const puppeteer = require('puppeteer')
const expect = require('expect')

async function testFlightRp () {
  const browser = await puppeteer.launch({ headless: false, slowMo: 20 })
  const page = await browser.newPage()
  const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 })
  await page.setViewport({ width: 1024, height: 768 })

  /*
  SELECTORS LILIGO
  */

  const resultDetailsButton = '.travel-details-button'
  const cta = '.cta'
  const price = '.price'
  const outboundDep = 'div.from > div.time.is-am'
  const outboundArr = 'div.to > div.time'
  const inboundDep = 'div.from > div.time'
  const inboundArr = 'div.to > div.time.is-am'
  const outboundDuration = 'div.outbound > div.timing > div.center > div.duration'
  const inboundDuration = 'div.return > div.timing > div.center > div.duration'

  /*
  PARAMETERS
  */

  let environment = 'http://' // http://, http://admin.
  let fromLocation = 'PAR'
  let toLocation = 'NYC'
  // departure
  let depYear = '2019'
  let depMonth = '4'
  let depDay = '16'
  // return
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

  let urlStructure = environment + 'liligo.es/air/SearchFlights.jsp' +
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

  console.log(urlStructure)
  await page.goto(urlStructure, { waitUntil: 'networkidle2', timeout: 0 })
  await page.waitForSelector(resultDetailsButton)
  await page.click(resultDetailsButton)[1]
  await page.waitForSelector(cta)[1]
  await page.click(cta)[1]

  await browser.close()
}
testFlightRp()
