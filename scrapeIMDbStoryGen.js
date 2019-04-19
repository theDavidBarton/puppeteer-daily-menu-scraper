const puppeteer = require('puppeteer')

async function scrapeIMDbStoryGen() {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US' })
  await page.goto('https://imdb.com', { waitUntil: 'domcontentloaded', timeout: 0 })
  let urlExistsOnIMDb = await page.$('a')
  let urlCountOnIMDb = (await page.$$('a')).length
  let urls = []
  let titles = []
  if (urlExistsOnIMDb !== null) {
    for (let i = 0; i < urlCountOnIMDb; i++) {
      let urlOnIMDbSelector = (await page.$$('a'))[i]
      let urlOnIMDb = await page.evaluate(el => el.href, urlOnIMDbSelector)
      let titleOnIMDb = await page.evaluate(el => el.textContent, urlOnIMDbSelector)
      urlOnIMDb = urlOnIMDb.replace(/(\?.*)/g, '').replace(/(\/$)/g, '')
      titleOnIMDb = titleOnIMDb.trim().replace('\n', '')
      // expected IMDb url pattern:
      if (urlOnIMDb.includes('/title/') && titleOnIMDb !== '') {
        urls.push(urlOnIMDb)
        titles.push(titleOnIMDb)
        console.log('• ' + titleOnIMDb + '\n• IMDb url: ' + urlOnIMDb + '\n')
      }
    }
  }
  console.log(titles)
  browser.close()
}
scrapeIMDbStoryGen()
