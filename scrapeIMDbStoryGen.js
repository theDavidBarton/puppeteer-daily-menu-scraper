const puppeteer = require('puppeteer')

async function scrapeIMDbStoryGen() {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  await page.goto('https://imdb.com', { waitUntil: 'domcontentloaded', timeout: 0 })
  let urlExistsOnIMDb = await page.$('a')
  let urlCountOnIMDb = (await page.$$('a')).length
  if (urlExistsOnIMDb !== null) {
    for (let i = 0; i < urlCountOnIMDb; i++) {
      let urlOnIMDbSelector = (await page.$$('a'))[i]
      let urlOnIMDb = await page.evaluate(el => el.href, urlOnIMDbSelector)
      urlOnIMDb = urlOnIMDb.replace(/(\?.*)/g, '').replace(/(\/$)/g, '')
      // expected IMDb url patterns:
      if (urlOnIMDb.includes('/title/')) {
        console.log('• IMDb url: ' + urlOnIMDb)
      }
    }
  }
  browser.close()
}
scrapeIMDbStoryGen()
