const puppeteer = require('puppeteer')

async function scrapeIMDbStoryGen() {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US' })
  await page.goto('https://imdb.com', { waitUntil: 'domcontentloaded', timeout: 0 })
  let urlExistsOnIMDb = await page.$('a')
  let urlCountOnIMDb = (await page.$$('a')).length
  let urls = []
  if (urlExistsOnIMDb !== null) {
    for (let i = 0; i < urlCountOnIMDb; i++) {
      let urlOnIMDbSelector = (await page.$$('a'))[i]
      let urlOnIMDb = await page.evaluate(el => el.href, urlOnIMDbSelector)
      let titleOnIMDb = await page.evaluate(el => el.innerText, urlOnIMDbSelector)
      urlOnIMDb = urlOnIMDb.replace(/(\?.*)/g, '').replace(/(\/$)/g, '')
      // expected IMDb url pattern:
      if (urlOnIMDb.includes('/title/')) {
        urls.push(urlOnIMDb)
        console.log('• ' + titleOnIMDb + '\nIMDb url: ' + urlOnIMDb)
      }
    }
  }
  console.log(urls)
  browser.close()
}
scrapeIMDbStoryGen()
