const puppeteer = require('puppeteer')
async function IMDbNetflixMovieRecommender() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 20 })
  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US' })
  await page.goto('https://www.imdb.com/chart/top', { waitUntil: 'domcontentloaded', timeout: 0 })
  let randomNumber1 = Math.floor(Math.random() * 250) + 1
  let randomNumber2 = Math.floor(Math.random() * 250) + 1
  if (randomNumber2 === randomNumber1) {
    let randomNumber2 = Math.floor(Math.random() * 250) + 1
  }
  let randomNumber3 = Math.floor(Math.random() * 250) + 1
  if (randomNumber3 === randomNumber1 || randomNumber3 === randomNumber2) {
    let randomNumber3 = Math.floor(Math.random() * 250) + 1
  }
  const randomTop250_1 = (await page.$$('.titleColumn'))[randomNumber1 - 1]
  const randomTop250_1Content = await page.evaluate(el => el.innerText, randomTop250_1)
  const randomTop250_1ContentClean = randomTop250_1Content.replace(/(\d)(.*)(\. )| \((.*)\)/g, '')
  console.log('#' + randomTop250_1Content)
  const randomTop250_2 = (await page.$$('.titleColumn'))[randomNumber2 - 1]
  const randomTop250_2Content = await page.evaluate(el => el.innerText, randomTop250_2)
  const randomTop250_2ContentClean = randomTop250_2Content.replace(/(\d)(.*)(\. )| \((.*)\)/g, '')
  console.log('#' + randomTop250_2Content)
  const randomTop250_3 = (await page.$$('.titleColumn'))[randomNumber3 - 1]
  const randomTop250_3Content = await page.evaluate(el => el.innerText, randomTop250_3)
  const randomTop250_3ContentClean = randomTop250_3Content.replace(/(\d)(.*)(\. )| \((.*)\)/g, '')
  console.log('#' + randomTop250_3Content)

  await page.goto('https://google.com', { waitUntil: 'networkidle0', timeout: 0 })
  await page.waitForSelector('.gsfi')
  await page.keyboard.type('"' + randomTop250_1ContentClean + '"' + ' site:netflix.com')
  await page.keyboard.press('Enter')
  await page.waitFor(4000)
  let randomTop250_1UrlExists = await page.$('cite')
  if (randomTop250_1UrlExists !== null) {
    let randomTop250_1UrlSelector = (await page.$$('cite'))[0]
    let randomTop250_1Url = await page.evaluate(el => el.textContent, randomTop250_1UrlSelector)
    randomTop250_1Url = randomTop250_1Url.replace(/(com)(.*)(?=\/title)/g, 'com')
    if (randomTop250_1Url.includes('https://www.netflix.com/title/')) {
      console.log('\n' + randomTop250_1ContentClean + ' on Netflix: ' + randomTop250_1Url)
    } else if (randomTop250_1Url.includes('https://dvd.netflix.com/Movie/')) {
      console.log('\n' + randomTop250_1ContentClean + ' on Netflix DVD: ' + randomTop250_1Url)
    } else {
      console.log('\n' + randomTop250_1ContentClean + ' is NOT on Netflix!')
    }
  } else {
    console.log('\n' + randomTop250_1ContentClean + ' is NOT on Netflix!')
  }
  await page.screenshot({ path: 'tmp/netflix01.png' })
  await page.click('.gsfi')
  await page.keyboard.down('ControlLeft')
  await page.keyboard.down('A')
  await page.keyboard.up('ControlLeft')
  await page.keyboard.up('A')
  await page.keyboard.type('"' + randomTop250_2ContentClean + '"' + ' site:netflix.com')
  await page.keyboard.press('Enter')
  await page.waitFor(4000)
  let randomTop250_2UrlExists = await page.$('cite')
  if (randomTop250_2UrlExists !== null) {
    let randomTop250_2UrlSelector = (await page.$$('cite'))[0]
    let randomTop250_2Url = await page.evaluate(el => el.textContent, randomTop250_2UrlSelector)
    randomTop250_2Url = randomTop250_2Url.replace(/(com)(.*)(?=\/title)/g, 'com')
    if (randomTop250_2Url.includes('https://www.netflix.com/title/')) {
      console.log(randomTop250_2ContentClean + ' on Netflix: ' + randomTop250_2Url)
    } else if (randomTop250_2Url.includes('https://dvd.netflix.com/Movie/')) {
      console.log(randomTop250_2ContentClean + ' on Netflix DVD: ' + randomTop250_2Url)
    } else {
      console.log(randomTop250_2ContentClean + ' is NOT on Netflix!')
    }
  } else {
    console.log(randomTop250_2ContentClean + ' is NOT on Netflix!')
  }
  await page.screenshot({ path: 'tmp/netflix02.png' })
  await page.click('.gsfi')
  await page.keyboard.down('ControlLeft')
  await page.keyboard.down('A')
  await page.keyboard.up('ControlLeft')
  await page.keyboard.up('A')
  await page.keyboard.type('"' + randomTop250_3ContentClean + '"' + ' site:netflix.com')
  await page.keyboard.press('Enter')
  await page.waitFor(4000)
  let randomTop250_3UrlExists = await page.$('cite')
  if (randomTop250_3UrlExists !== null) {
    let randomTop250_3UrlSelector = (await page.$$('cite'))[0]
    let randomTop250_3Url = await page.evaluate(el => el.textContent, randomTop250_3UrlSelector)
    randomTop250_3Url = randomTop250_3Url.replace(/(com)(.*)(?=\/title)/g, 'com')
    if (randomTop250_3Url.includes('https://www.netflix.com/title/')) {
      console.log(randomTop250_3ContentClean + ' on Netflix: ' + randomTop250_3Url)
    } else if (randomTop250_3Url.includes('https://dvd.netflix.com/Movie/')) {
      console.log(randomTop250_3ContentClean + ' on Netflix DVD: ' + randomTop250_3Url)
    } else {
      console.log(randomTop250_3ContentClean + ' is NOT on Netflix!')
    }
  } else {
    console.log(randomTop250_3ContentClean + ' is NOT on Netflix!')
  }
  await page.screenshot({ path: 'tmp/netflix03.png' })

  await browser.close()
}
IMDbNetflixMovieRecommender()
