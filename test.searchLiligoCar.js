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
  const pickupHeaderContentToBe = 'Marrakech'

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

  const clickoutHome = '.hp-searcharea' // the searchform's background on homepage or v6
  const clickoutSeo = '.sc-searchform' // the searchform's background on SEO (sc)

  const simplePagination = 'div.simplepagination-filter'
  const carResultItem = '.car-result-item'

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

  console.log('√ WHEN I set pick up with keyboard and arrows to ' + carPickupContent)

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

  await page.waitForSelector(carSubmit)
  await page.click(carSubmit)

  console.log('√ AND I launch search')

  /*
   -----------------------------------
   RESULT PAGE
   -----------------------------------
  */

  await page.waitForSelector(carResultItem)

  console.log('√ THEN resultpage appears')
  console.log('√ AND results appear')
  const pickupHeaderSelector = (await page.$$('.results-header-code'))[0]
  let pickupHeaderContent = await page.evaluate(el => el.textContent, pickupHeaderSelector)
  expect(pickupHeaderContent).toBe(pickupHeaderContentToBe)

  console.log('√ AND pickup: ' + pickupHeaderContent + ' from result header matches ' + pickupHeaderContentToBe + ' from homepage')

  await navigationPromise
  // make sure search finished
  await page.waitForSelector(simplePagination)

  await browser.close()
}
testCar()
