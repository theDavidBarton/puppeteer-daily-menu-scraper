const puppeteer = require('puppeteer')

async function scrapeIMDbStoryGen() {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US' })
  await page.goto('https://www.imdb.com/chart/top', { waitUntil: 'domcontentloaded', timeout: 0 })
  let urlExistsOnIMDb = await page.$('a')
  let urlCountOnIMDb = (await page.$$('a')).length
  let urls = []
  let titles = []
  let n
  let plot
  let actorNames
  let actorNamesTwisted = []

  // scrape all movie links from a specific IMDb page
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
        // optional listing of all movie tiles and IMDb links
        // console.log('• ' + titleOnIMDb + '\n• IMDb url: ' + urlOnIMDb + '\n')
      }
    }
  }

  // try scraping movie plots until it finds one which have actor names in it
  do {
    do {
      n = 0
      n++
      console.log('Try #' + n)
      var random = Math.floor(Math.random() * urls.length)
      console.log('Chosen movie: ' + titles[random])
      await page.goto(urls[random] + '/plotsummary#synopsis', {
        waitUntil: 'domcontentloaded',
        timeout: 0
      })
      plot = await page.evaluate(el => el.textContent, (await page.$$('#plot-synopsis-content'))[0])
      plot = plot.trim()
      if (!plot.includes("It looks like we don't have a Synopsis for this title yet. ")) {
        console.log(plot)
      } else {
        console.log('THERE IS NO PLOT AVAILABLE')
      }
    } while (plot.includes("It looks like we don't have a Synopsis for this title yet. "))

    // matching as much as possible actor names based on IMDb patterns, regex source: https://stackoverflow.com/questions/7653942/find-names-with-regular-expression
    actorNames = plot.match(
      /\(([A-Z]([a-z]+|\.)(?:\s+[A-Z]([a-z]+|\.))*(?:\s+[a-z][a-z\-]+){0,2}\s+[A-Z]([a-z]+|\.)+)\)/gm
    )
    if (actorNames !== null) {
      actorNames = actorNames
        .toString()
        .replace(/\(|\)/g, '')
        .split(',')
      console.log('\nStarring: ')
      console.log(actorNames)

    } else {
      console.log('\nNO ACTORS WERE LISTED')
    }
  } while (actorNames === null)

  // scrapes the next movie item's cast list for a new actor array
  await page.goto(urls[random + 1], { waitUntil: 'domcontentloaded', timeout: 0 })
  console.log('\nChosen cast replacement: ' + titles[random + 1])
  let castListExists = (await page.$$('tr > td'))[2]
  let castCount = (await page.$$('.character')).length
  if (castListExists !== null) {
    // get as many actor names as possible
    // (as the actor names are incremented in +=4 step the "castCount * 3" formula ensures not to run over on the actor list)
    for (let i = 2; i < castCount * 3; i += 4) {
      let castMemberSelector = (await page.$$('tr > td'))[i]
      let castMemberName = await page.evaluate(el => el.textContent, castMemberSelector)
      castMemberName = castMemberName.trim().replace('\n', '')
      actorNamesTwisted.push(castMemberName)
    }
  }
  console.log('\nStarring (re-casted): ')
  console.log(actorNamesTwisted)

  // mixes in the new cast to the first movie's plot description
  let plotTwist = plot
  for (let i = 0; i < actorNames.length; i++) {
    plotTwistMatch = plotTwist.match(actorNames[i])
    plotTwist = plotTwist.replace(plotTwistMatch, actorNamesTwisted[i])
  }
  console.log('\nTWISTED STORY PLOT: ' + plotTwist)
  browser.close()
}
scrapeIMDbStoryGen()
