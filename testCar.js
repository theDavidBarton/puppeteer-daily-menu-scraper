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

  const urlCarEntrypage = 'http://www.liligo.fr/location-voiture.html'
  const carEntryPageTitlePart = 'LILIGO.com'
  const carRedirectPageTitlePart = 'Redirection'
  const carPickupTypeLetters = 'Marr'
  const carPickupContentToBe = 'Marrakech, Menara Airport - Maroc'

  /*
   -----------------------------------
   SELECTORS
   -----------------------------------
  */

  const carPickup = '#car-pickup'
  const complocFirst = '#liligo_cl2_item_0'
  const complocSecond = '#liligo_cl2_item_1'
  const carPickupDate = '.car-date-and-time'
  const carDropoffDate = '.car-date-and-time'
  const deselectComparesite = '.hp-searchform-comparesite-selectnone'
  const carSubmit = '#car-submit'

  await page.goto(urlCarEntrypage, { waitUntil: 'domcontentloaded', timeout: 0 }) // Firefox: remove "{ waitUntil: 'networkidle2', timeout: 0 }"

  /*
   -----------------------------------
   LOCATIONS
   -----------------------------------
  */

  let carEntryPageTitle = await page.title()
  expect(carEntryPageTitle).toContain(carEntryPageTitlePart)
  console.log(carEntryPageTitle + ' contains ' + carEntryPageTitlePart)

  console.log('√ GIVEN I am on the SEO page: ' + urlCarEntrypage)

  await page.waitForSelector(carPickup)
  await page.click(carPickup)
  await page.keyboard.type(carPickupTypeLetters)
  await page.waitFor(1000)
  await page.waitForSelector(complocSecond)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  let carPickupContent = await page.evaluate(el => el.value, await page.$(carPickup))
  expect(carPickupContent).toBe(carPickupContentToBe)

  await page.waitForSelector(deselectComparesite)
  await page.click(deselectComparesite)

  console.log('√ WHEN I deselect comparesites')

  await page.waitForSelector(carSubmit)
  await page.click(carSubmit)

  console.log('√ AND I launch search')

  await browser.close()
}
testCar()
