jest.setTimeout(30000)

const puppeteer = require('puppeteer')

let browser
let page
let navigationPromise

beforeAll(async () => {
  browser = await puppeteer.launch({ headless: false, slowMo: 20 })
  page = await browser.newPage()
  navigationPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 })
  await page.setViewport({ width: 1024, height: 768 })
})

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

describe('Liligo Car search', () => {
  test('GIVEN I am on the SEO page: ' + urlCarEntrypage, async () => {
    await page.goto(urlCarEntrypage, { waitUntil: 'domcontentloaded', timeout: 0 }) // Firefox: remove "{ waitUntil: 'networkidle2', timeout: 0 }"
  })

  /*
   -----------------------------------
   LOCATIONS
   -----------------------------------
  */

  test('AND page title contains ' + carEntryPageTitlePart, async () => {
    let carEntryPageTitle = await page.title()
    expect(carEntryPageTitle).toContain(carEntryPageTitlePart)
  })

  test('WHEN I set pick up with keyboard and arrows', async () => {
    await page.waitForSelector(carPickup)
    await page.click(carPickup)
    await page.keyboard.type(carPickupTypeLetters)
    await page.waitFor(1000)
    await page.waitForSelector(complocSecond)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    let carPickupContent = await page.evaluate(el => el.value, await page.$(carPickup))
    expect(carPickupContent).toBe(carPickupContentToBe)
  })

  /*
   -----------------------------------
   CLICKOUT (promise.race)
   -----------------------------------
  */

  test('AND I clickout from homepage searchform', async () => {
    await Promise.race([page.waitForSelector(clickoutHome), page.waitForSelector(clickoutSeo)])
    if ((await page.$(clickoutHome)) !== null) {
      await page.click(clickoutHome)
    } else {
      await page.click(clickoutSeo)
    }
  })

  test('AND I deselect comparesites', async () => {
    await page.waitForSelector(deselectComparesite)
    await page.click(deselectComparesite)
  })

  test('AND I launch search', async () => {
    await page.waitForSelector(carSubmit)
    await page.click(carSubmit)
  })

  /*
   -----------------------------------
   RESULT PAGE
   -----------------------------------
  */

  test('THEN resultpage appears', async () => {
    await page.waitForSelector(carResultItem)
  })

  test('AND pickup from result header matches from homepage', async () => {
    const pickupHeaderSelector = (await page.$$('.results-header-code'))[0]
    let pickupHeaderContent = await page.evaluate(el => el.textContent, pickupHeaderSelector)
    expect(pickupHeaderContent).toBe(pickupHeaderContentToBe)
    await navigationPromise
    // make sure search finished
    await page.waitForSelector(simplePagination)
  })

  afterAll(async () => {
    await browser.close()
  })
})
