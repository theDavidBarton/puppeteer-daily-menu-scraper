const puppeteer = require('puppeteer')
const expect = require('expect')

async function testFlightRp () {
  const browser = await puppeteer.launch({ headless: false, slowMo: 20 })
  const page = await browser.newPage()
  await page.setViewport({ width: 1024, height: 768 })

  // abort 3rd party content, source: https://github.com/GoogleChrome/puppeteer/blob/master/examples/block-images.js
  await page.setRequestInterception(true)
  page.on('request', interceptedRequest => {
    if (interceptedRequest.url().startsWith('https://cdn.ampproject.org') ||
      interceptedRequest.url().startsWith('https://ads.travelaudience.com') ||
      interceptedRequest.url().startsWith('https://tpc.googlesyndication.com') ||
      interceptedRequest.url().startsWith('https://www.google') ||
      interceptedRequest.url().startsWith('') ||
      interceptedRequest.url().startsWith('https://pixel.rubiconproject.com')) {
      interceptedRequest.abort()
    } else {
      interceptedRequest.continue()
    }
  })

  /*
  SELECTORS LILIGO
  */

  const resultDetailsButton = '.travel-details-button'
  const cta = '.cta'
  const price = '.price'
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

  console.log(urlStructure)
  await page.goto(urlStructure, { waitUntil: 'networkidle2', timeout: 0 })
  await page.waitForSelector(resultDetailsButton)
  await page.click(resultDetailsButton)[0]
  // stores all the first result's data to be compared
  let outboundDepData = await page.evaluate(
    el => el.textContent, await page.$$(outboundDep)[0]
  )
  let outboundDepData2 = page.$$('div.from > div.time.is-am')[1].innerText
  console.log(outboundDepData + '\n' + outboundDepData2)

  await page.waitForSelector(cta)
  await page.click(cta)[0]

  await browser.close()
}
testFlightRp()
