const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 150
  })
  const page = await browser.newPage()
  const navigationPromise = page.waitForNavigation()
  await page.setViewport({ width: 1366, height: 768});

  // Given I am on the homepage
  await page.goto('https://www.liligo.fr/')

  // When I set departure
  await page.waitForSelector('#air-from')
  await page.click('#air-from')
  await page.keyboard.type('SFO');
  await page.waitForSelector('#liligo_cl2_item_0');
  await page.click('#liligo_cl2_item_0');

  // And I set arrival
  await page.waitForSelector('#air-to')
  await page.click('#air-to')
  await page.keyboard.type('PAR');
  await page.waitForSelector('#liligo_cl2_item_1');
  await page.click('#liligo_cl2_item_1');

  // And I set date
/* await page.waitForSelector('.field > #air-out-date > div > #air-out-date-value > span')
  await page.click('.field > #air-out-date > div > #air-out-date-value > span')
  await page.waitForSelector('.datepicker > .dpBody > .dpMonth > .dpMonthHeader > .dpNext')
  await page.click('.datepicker > .dpBody > .dpMonth > .dpMonthHeader > .dpNext')

  await page.waitForSelector('table > tbody > tr > .hover > a')
  await page.click('table > tbody > tr > .hover > a')
*/
  // Then popup checkboxes appear below
  // And I disable popup checkboxes
  await page.waitForSelector('.hp-searchform-comparesite-selectnone')
  await page.click('.hp-searchform-comparesite-selectnone')

  // When I launch search
  await page.waitForSelector('#air-submit')
  await page.click('#air-submit')

  // Then result page appears
  // And results appear
  await page.waitForSelector('div:nth-child(5) > div:nth-child(1) > div > div > travel-result-item-desktop > .travel-result-item > .desktop > .travel-details-button')
  await page.click('div:nth-child(5) > div:nth-child(1) > div > div > travel-result-item-desktop > .travel-result-item > .desktop > .travel-details-button')
  await page.click('div:nth-child(5) > div:nth-child(1) > div > div > travel-result-item-desktop > .travel-result-item > .desktop > .travel-details-button')

  // And I pause the search
  // await page.waitForSelector('.results-header-container-inner > div > .results-header-action > .results-header-action-stop > .results-header-action-button-label')
  // await page.click('.results-header-container-inner > div > .results-header-action > .results-header-action-stop > .results-header-action-button-label')

  await navigationPromise

  await page.waitForSelector('travel-result-item-desktop > .travel-result-item > .details-opened > .booking > .cta')
  await page.click('travel-result-item-desktop > .travel-result-item > .details-opened > .booking > .cta')

  await navigationPromise

  await browser.close()
})()
