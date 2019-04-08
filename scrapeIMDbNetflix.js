const puppeteer = require('puppeteer')
async function IMDbNetflixMovieRecommender() {
  const browser = await puppeteer.launch({ headless: false, slowMo:20 })
  const page = await browser.newPage()
  /*
  await page.goto('https://imdb.com', { waitUntil:'domcontentloaded', timeout:0 })
  // const top250Link = (await page.$x('//a[contains(text(), "Top Rated Movies")]'))[0]
  await page.hover('#navTitleMenu')
  await page.waitFor(2000)
  await page.waitForSelector('#navMenu1 > div:nth-child(2) > ul:nth-child(2) > li:nth-child(6) > a')
  await page.click('#navMenu1 > div:nth-child(2) > ul:nth-child(2) > li:nth-child(6) > a')
  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 })
*/
  await page.goto('https://www.imdb.com/chart/top', { waitUntil:'domcontentloaded', timeout:0 })
  var randomNumber1 = Math.floor(Math.random() * 250) + 1
  var randomNumber2 = Math.floor(Math.random() * 250) + 1
  if (randomNumber2 === randomNumber1) {
    var randomNumber2 = Math.floor(Math.random() * 250) + 1
  }
  var randomNumber3 = Math.floor(Math.random() * 250) + 1
  if (randomNumber3 === randomNumber1 || randomNumber3 === randomNumber2) {
    var randomNumber3 = Math.floor(Math.random() * 250) + 1
  }
  const randomTop250_1 = (await page.$$('.titleColumn'))[randomNumber1 - 1]
  const randomTop250_1Content = await page.evaluate(el => el.innerText, randomTop250_1)
  const randomTop250_1ContentClean = randomTop250_1Content.replace(/([0-9])| \(|\)|\. /g, '')
  console.log(randomTop250_1Content)
  const randomTop250_2 = (await page.$$('.titleColumn'))[randomNumber2 - 1]
  const randomTop250_2Content = await page.evaluate(el => el.innerText, randomTop250_2)
  const randomTop250_2ContentClean = randomTop250_2Content.replace(/([0-9])| \(|\)|\. /g, '')
  console.log(randomTop250_2Content)
  const randomTop250_3 = (await page.$$('.titleColumn'))[randomNumber3 - 1]
  const randomTop250_3Content = await page.evaluate(el => el.innerText, randomTop250_3)
  const randomTop250_3ContentClean = randomTop250_3Content.replace(/([0-9])| \(|\)|\. /g, '')
  console.log(randomTop250_3Content)

  await page.goto('https://google.com', { waitUntil: 'networkidle0', timeout: 0 })
  await page.waitForSelector('.gsfi')
  await page.keyboard.type('"' + randomTop250_1ContentClean + '"' + ' site:netflix.com')
  await page.keyboard.press('Enter')
  await page.waitFor(4000)
  await page.screenshot({ path: 'tmp/netflix01.png' })
  await page.click('.gsfi')
  await page.keyboard.down('ControlLeft')
  await page.keyboard.down('A')
  await page.keyboard.up('ControlLeft')
  await page.keyboard.up('A')
  await page.keyboard.type('"' + randomTop250_2ContentClean + '"' + ' site:netflix.com')
  await page.keyboard.press('Enter')
  await page.waitFor(4000)
  await page.screenshot({ path: 'tmp/netflix02.png' })
  await page.click('.gsfi')
  await page.keyboard.down('ControlLeft')
  await page.keyboard.down('A')
  await page.keyboard.up('ControlLeft')
  await page.keyboard.up('A')
  await page.keyboard.type('"' + randomTop250_3ContentClean + '"' + ' site:netflix.com')
  await page.keyboard.press('Enter')
  await page.waitFor(4000)
  await page.screenshot({ path: 'tmp/netflix03.png' })

  await browser.close()
}
IMDbNetflixMovieRecommender()
