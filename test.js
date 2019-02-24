const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage()
  const navigationPromise = page.waitForNavigation()

  // Given I am on the homepage
  await page.goto('https://www.liligo.fr/')
  await page.setViewport({ width: 1280, height: 657 })

  // When I set departure
  await page.waitForSelector('.hp-searcharea > .hp-searcharea-form > #hp-searchform-air > .field > #air-from')
  await page.click('.hp-searcharea > .hp-searcharea-form > #hp-searchform-air > .field > #air-from')
  await page.keyboard.type('SFO');

  // And I set arrival
  await page.waitForSelector('.hp-searcharea > .hp-searcharea-to > #hp-searchform-air > .field > #air-to')
  await page.click('.hp-searcharea > .hp-searcharea-to > #hp-searchform-air > .field > #air-to')
  await page.keyboard.type('PAR');

  await navigationPromise

  await page.waitForSelector('.field > #air-out-date > div > #air-out-date-value > span')
  await page.click('.field > #air-out-date > div > #air-out-date-value > span')

  await page.waitForSelector('.datepicker > .dpBody > .dpMonth > .dpMonthHeader > .dpNext')
  await page.click('.datepicker > .dpBody > .dpMonth > .dpMonthHeader > .dpNext')

  await page.waitForSelector('table > tbody > tr > .hover > a')
  await page.click('table > tbody > tr > .hover > a')

  await page.waitForSelector('#hp-searchform-air > #air-more > .hp-searchform-comparesite > .hp-searchform-comparesite-selectbuttons > .hp-searchform-comparesite-selectnone')
  await page.click('#hp-searchform-air > #air-more > .hp-searchform-comparesite > .hp-searchform-comparesite-selectbuttons > .hp-searchform-comparesite-selectnone')

  await page.waitForSelector('.hp-searcharea > .hp-searcharea-form > #hp-searchform-air > .hp-searchform-submit > #air-submit')
  await page.click('.hp-searcharea > .hp-searcharea-form > #hp-searchform-air > .hp-searchform-submit > #air-submit')

  await page.waitForSelector('.results-header-container-inner > div > .results-header-action > .results-header-action-stop > .results-header-action-button-label')
  await page.click('.results-header-container-inner > div > .results-header-action > .results-header-action-stop > .results-header-action-button-label')

  await navigationPromise

  await page.waitForSelector('div:nth-child(5) > div:nth-child(1) > div > div > travel-result-item-desktop > .travel-result-item > .desktop > .travel-details-button')
  await page.click('div:nth-child(5) > div:nth-child(1) > div > div > travel-result-item-desktop > .travel-result-item > .desktop > .travel-details-button')

  await page.waitForSelector('travel-result-item-desktop > .travel-result-item > .details-opened > .booking > .cta')
  await page.click('travel-result-item-desktop > .travel-result-item > .details-opened > .booking > .cta')

  await navigationPromise

  await browser.close()
})()
