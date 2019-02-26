// scraping with Puppeteer example
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  //const navigationPromise = page.waitForNavigation()

  await page.setViewport({ width: 1024, height: 768 })

  await page.goto('https://www.liligo.fr/', { waitUntil: 'networkidle2' })
  let linkText = await page.evaluate(el => el.innerHTML, await page.$('body > header > h1 > span > a'))
    console.log(linkText)
  let bodyHTML = await page.evaluate(() => document.body.innerHTML)
    console.log(bodyHTML)

  await page.pdf({ path: './tmp/lilihome.pdf' })
    console.log('pdf is created')

  await browser.close()
})()
