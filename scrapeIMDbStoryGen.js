const puppeteer = require('puppeteer')

async function scrapeIMDbStoryGen() {
  const browser = await puppeteer.launch({ headless: false })
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
        // console.log('• ' + titleOnIMDb + '\n• IMDb url: ' + urlOnIMDb + '\n')
      }
    }
  }
  let n = 0
  let plot
  do {
    let random = Math.floor(Math.random() * urls.length)
    console.log('Chosen movie: ' + titles[random])
    await page.goto(urls[random] + '/plotsummary#synopsis', { waitUntil: 'domcontentloaded', timeout: 0 })
    plot = await page.evaluate(el => el.textContent, (await page.$$('#plot-synopsis-content'))[0])
    plot = plot.trim()
    n++
    console.log('Try #' + n)
    if (!plot.includes("It looks like we don't have a Synopsis for this title yet. ")) {
      console.log(plot)
    } else {
      console.log('THERE IS NO PLOT AVAILABLE')
    }
  } while (plot.includes("It looks like we don't have a Synopsis for this title yet. "))
  // source for matching as much as possible actor names: https://stackoverflow.com/questions/7653942/find-names-with-regular-expression
  let actorNameRegex = plot.match(
    /\(([A-Z]([a-z]+|\.)(?:\s+[A-Z]([a-z]+|\.))*(?:\s+[a-z][a-z\-]+){0,2}\s+[A-Z]([a-z]+|\.)+)\)/gm
  )
  let actorNames = []
  if (actorNameRegex !== null) {
    actorNameRegex = actorNameRegex.toString().replace(/\(|\)/g, '')
    actorNames.push(actorNameRegex)
    console.log('\nStarring: ' + actorNames)
  } else {
    console.log('\nNO ACTORS WERE LISTED')
  }
  browser.close()
}
scrapeIMDbStoryGen()
