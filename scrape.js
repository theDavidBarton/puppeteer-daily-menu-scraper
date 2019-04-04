// scraping with Puppeteer example
const puppeteer = require('puppeteer')
const expect = require('expect')

async function scrapePage() {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  const navigationPromise = page.waitForNavigation()

  await page.setViewport({ width: 1024, height: 768 })

  await page.goto('http://www.liligo.fr/', { waitUntil: 'networkidle2', timeout: 0 })
  await navigationPromise
  let linkText = await page.evaluate(
    el => el.innerHTML,
    await page.$('body > header > h1 > span > a')
  )
  console.log(linkText)
  expect(linkText).toBe('vol pas cher')
  console.log("it's a match")
  let bodyHTML = await page.evaluate(() => document.body.innerHTML)
  console.log(bodyHTML)

  await page.pdf({ path: './tmp/lilihome.pdf' }) // works only in headless mode
  console.log('pdf is created')

  await browser.close()
}
scrapePage()
