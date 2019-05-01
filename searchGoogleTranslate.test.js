// jest structure sceleton
// increase the default (5000 ms) timeout to 30 secs
jest.setTimeout(30000)

const puppeteer = require('puppeteer')

// declare the variables outside of beforeAll so 'browser' and 'page' will be available in describe block as well
let browser, page

// beforeAll starts
beforeAll(async function() {
  browser = await puppeteer.launch({ headless: false, slowMo: 20 })
  page = await browser.newPage()
  await page.setViewport({ width: 1024, height: 768 })
})
// beforeAll ends

// describe starts
describe('Google Translate (FR)', function() {
  // test #1 starts
  test('has title on French', async function() {
    await page.goto('https://translate.google.com/?hl=fr', { waitUntil: 'domcontentloaded', timeout: 0 })
    const title = await page.title()
    expect(title).toBe('Google Traduction')
  })
  // test #1 ends
  // test #2 starts
  test('"puppeteer" (EN) word typed and translated to "marionnettiste" (FR)', async function() {
    await page.waitFor(500)
    await page.keyboard.type('puppeteer')
    await page.waitForSelector('.translation')
    let translation = await page.evaluate(el => el.textContent, await page.$('.translation'))
    expect(translation).toBe('marionnettiste')
  })
  // test #2 ends

  // afterAll starts
  afterAll(async function() {
    await browser.close()
  })
  // afterAll ends
})
// describe ends
