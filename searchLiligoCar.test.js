jest.setTimeout(30000)

const puppeteer = require('puppeteer')
// const puppeteerFirefox = require('puppeteer-firefox')

let browser, page, navigationPromise

beforeAll(async function() {
  browser = await puppeteer.launch({ headless: false, slowMo: 20 })
  page = await browser.newPage()
  navigationPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 }) // for Firefox: remove "{ waitUntil: '...', timeout: x }"
  await page.setViewport({ width: 1024, height: 768 })
})

/*
 * -----------------------------------
 * TEST VALUES
 * -----------------------------------
 */

const urlCarEntrypage = 'http://www.liligo.fr/location-voiture.html'
const carEntryPageTitlePart = 'LILIGO.com'
// const carRedirectPageTitlePart = 'Redirection'
const carPickupTypeLetters = 'Marr'
const carPickupContentToBe = 'Marrakech, Menara Airport - Maroc'
const pickupHeaderContentToBe = 'Marrakech'

/*
 * -----------------------------------
 * SELECTORS
 * -----------------------------------
 */

const carPickup = '#car-pickup'
// const complocFirst = '#liligo_cl2_item_0'
const complocSecond = '#liligo_cl2_item_1'
/*
 * const carPickupDate = '.car-date-and-time'
 * const carDropoffDate = '.car-date-and-time'
 */
const deselectComparesite = '.hp-searchform-comparesite-selectnone'
const carSubmit = '#car-submit'

const clickoutHome = '.hp-searcharea' // the searchform's background on homepage or v6
const clickoutSeo = '.sc-searchform' // the searchform's background on SEO (sc)

const simplePagination = 'div.simplepagination-filter'
const carResultItem = '.car-result-item'
const pickupHeaderSelectorInside = '.results-header-code'

describe('Liligo Car search', function() {
  test('GIVEN I am on the SEO page: ' + urlCarEntrypage, async function() {
    await page.goto(urlCarEntrypage, { waitUntil: 'domcontentloaded', timeout: 0 }) // firefox: remove "{ waitUntil: 'networkidle2', timeout: 0 }"
  })

  /*
   * -----------------------------------
   * LOCATIONS
   * -----------------------------------
   */

  test('AND page title contains ' + carEntryPageTitlePart, async function() {
    let carEntryPageTitle = await page.title()
    expect(carEntryPageTitle).toContain(carEntryPageTitlePart)
  })

  test('WHEN I set pick up with keyboard and arrows', async function() {
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
   * -----------------------------------
   * CLICKOUT (promise.race)
   * -----------------------------------
   */

  test('AND I clickout from homepage searchform', async function() {
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
    await page.waitForSelector(carSubmit)
    await page.click(carSubmit)
  })

  /*
   * -----------------------------------
   * RESULT PAGE
   * -----------------------------------
   */

  test('THEN resultpage appears', async function() {
    await page.waitForSelector(carResultItem)
  })

  test('AND pickup from result header matches from homepage', async function() {
    const pickupHeaderSelector = (await page.$$(pickupHeaderSelectorInside))[0]
    let pickupHeaderContent = await page.evaluate(el => el.textContent, pickupHeaderSelector)
    expect(pickupHeaderContent).toBe(pickupHeaderContentToBe)
    await navigationPromise
    // make sure search finished
    await page.waitForSelector(simplePagination)
  })

  afterAll(async function() {
    await browser.close()
  })
})
