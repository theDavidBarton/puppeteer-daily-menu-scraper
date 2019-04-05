const puppeteer = require('puppeteer')
const expect = require('expect')

async function testCar() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 20 })
  const page = await browser.newPage()
  const navigationPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 })
  await page.setViewport({ width: 1024, height: 768 })
  console.log('... puppeteer has launched')

  /*
   -----------------------------------
   TEST VALUES
   -----------------------------------
  */

  const urlCarEntrypage = 'https://www.liligo.fr/location-voiture.html'
  const carEntryPageTitlePart = 'LILIGO.com'
  const carRedirectPageTitlePart = 'Redirection'
  const carPickupContentToBe = 'Marrakech, Menara Airport - Maroc'

  /*
   -----------------------------------
   SELECTORS
   -----------------------------------
  */


  console.log('hi')
}
testCar()
