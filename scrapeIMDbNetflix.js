const puppeteer = require('puppeteer')
async function IMDbNetflixMovieRecommender() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 20 })
  const page = await browser.newPage()
  // customized Fisher-Yates shuffle, source of original: http://sedition.com/perl/javascript-fy.html
  function fisherYatesShuffle(array) {
    let currentIndexTop250 = 250,
      temporaryValue,
      randomIndexTop250
    while (0 !== currentIndexTop250) {
      randomIndexTop250 = Math.floor(Math.random() * currentIndexTop250)
      currentIndexTop250 -= 1
      temporaryValue = array[currentIndexTop250]
      array[currentIndexTop250] = array[randomIndexTop250]
      array[randomIndexTop250] = temporaryValue
    }
    return array
  }
  // fill an array 1 - 250 and apply the Fisher-Yates shuffle on the whole
  let array250 = Array.from({ length: 250 }, (_, x) => x + 1)
  array250 = fisherYatesShuffle(array250)
  let movieNames = []
  let numberOfRecommendations = 3
  // scrape a given number of movie titles (numberOfRecommendations) from IMDb Top 250
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US' })
  await page.goto('https://www.imdb.com/chart/top', { waitUntil: 'domcontentloaded', timeout: 0 })
  let recommendText = 'I recommend you the following ' + numberOfRecommendations + ' movies from IMDB Top 250: '
  console.log(recommendText + '\n' + '-'.repeat(recommendText.length))
  for (let i = 0; i < numberOfRecommendations; i++) {
    const randomTop250Selector = (await page.$$('.titleColumn'))[array250[i] - 1]
    const randomTop250Content = await page.evaluate(el => el.innerText, randomTop250Selector)
    const randomTop250ContentClean = randomTop250Content.replace(
      /(\d)(\d)(\d)(\. )|(\d)(\d)(\. )|(\d)(\. )| \((\d...)\)/g,
      ''
    )
    movieNames.push(randomTop250ContentClean)
    console.log('#' + randomTop250Content)
  }
  let netflixText = '\nWatch them on Netflix: '
  console.log(netflixText + '\n' + '-'.repeat(netflixText.length))
  // use Google search to find if the movies are available on either Netflix stream or DVD
  await page.goto('https://google.com/?hl=en', { waitUntil: 'networkidle0', timeout: 0 })
  await page.waitForSelector('.gsfi')
  for (let i = 0; i < numberOfRecommendations; i++) {
    await page.click('.gsfi')
    await page.keyboard.down('ControlLeft')
    await page.keyboard.down('A')
    await page.keyboard.up('ControlLeft')
    await page.keyboard.up('A')
    await page.keyboard.type('"' + movieNames[i] + '"' + ' site:netflix.com')
    await page.keyboard.press('Enter')
    await page.waitFor(4000)
    let randomTop250UrlExists = await page.$('cite')
    if (randomTop250UrlExists !== null) {
      let randomTop250UrlSelector = (await page.$$('cite'))[0]
      let randomTop250Url = await page.evaluate(el => el.textContent, randomTop250UrlSelector)
      randomTop250Url = randomTop250Url.replace(/(com)(.*)(?=\/title)/g, 'com')
      // expected Netflix url patterns:
      // https://www.netflix.com/hu/title/959008 <= standard
      if (randomTop250Url.includes('https://www.netflix.com/title/')) {
        console.log('• ' + movieNames[i] + ' on Netflix: ' + randomTop250Url)
        // https://www.netflix.com/Movie/The_Truman_Show/11819086 <= custom
      } else if (randomTop250Url.includes('https://www.netflix.com/Movie/')) {
        console.log('• ' + movieNames[i] + ' on Netflix: ' + randomTop250Url)
        // https://dvd.netflix.com/Movie/It-s-a-Wonderful-Life/644637 <= DVD
      } else if (randomTop250Url.includes('https://dvd.netflix.com/Movie/')) {
        console.log('• ' + movieNames[i] + ' on Netflix DVD: ' + randomTop250Url)
      } else {
        console.log('• ' + movieNames[i] + ' is NOT on Netflix!')
      }
    } else {
      console.log('• ' + movieNames[i] + ' is NOT on Netflix!')
    }
    let screenshotName = 'tmp/netflix' + (i + 1) + '.png'
    await page.screenshot({ path: screenshotName })
  }
  await browser.close()
}
IMDbNetflixMovieRecommender()
