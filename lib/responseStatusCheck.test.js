/*jest.setTimeout(30000)

const puppeteer = require('puppeteer')
const responseStatusCheck = require('./../lib/responseStatusCheck')

let browser, page, browserWSEndpoint
const urlTocheck = 'about:blank'

beforeAll(async function() {
  browser = await puppeteer.launch()
  page = await browser.newPage()
  browserWSEndpoint = await browser.wsEndpoint()
  module.exports = browserWSEndpoint
})

describe('response status checker', function() {
  test('should say OK if url is available', async function() {
    await page.setExtraHTTPHeaders({ status: '200' })
    const response = await page.goto(urlTocheck)
    console.log(response.status())
    // await responseStatusCheck.responseStatusCheck(paramIcon)
  })
  test('should say ERROR if url is not available', async function() {
    await page.setExtraHTTPHeaders({ status: '404' })
    const response = await page.goto(urlTocheck)
    console.log(response.status())
    // await responseStatusCheck.responseStatusCheck(paramIcon)
  })
  afterAll(async function() {
    await browser.close()
  })
})
*/
