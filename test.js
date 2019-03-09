// testing with Puppeteer example
const puppeteer = require('puppeteer');
const expect = require('expect');

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 30 })
  const page = await browser.newPage()
  const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 })

  await page.setViewport({ width: 1024, height: 768 })
    console.log('√ puppeteer has launched')
  // selector collection
      const airFrom             = '#air-from'
      const airTo               = '#air-to'
      const complocFirst        = '#liligo_cl2_item_0'
      const complocSecond       = '#liligo_cl2_item_1'
      const airFromDate         = '#air-out-date-value'
      const airToDate           = '#air-ret-date-value'
      const deselectComparesite = '.hp-searchform-comparesite-selectnone'
      const airSubmit           = '#air-submit'



  // Given I am on the homepage
  await page.goto('https://www.liligo.fr/', { waitUntil: 'networkidle2', timeout: 0 })
    console.log('√ page is loaded successfully with all its assets')

  // When I set departure
  await page.waitForSelector(airFrom)
  await page.click(airFrom)
  await page.keyboard.type('San f')
  await page.waitForSelector(complocFirst)
  await page.click(complocFirst)
  let airFromContent = await page.evaluate(el => el.value, await page.$(airFrom))
  expect(airFromContent).toBe('San Francisco,  CA, Etats-Unis (SFO)')
    console.log('√ departure is set ' + airFromContent)


  // And I set arrival
  await page.keyboard.type('Par')
  await page.waitForSelector(complocSecond)
  await page.click(complocSecond)
  let airToContent = await page.evaluate(el => el.value, await page.$(airTo))
  expect(airToContent).toBe('Paris, France (CDG)')
    console.log('√ arrival is set ' + airToContent)


  // And I set date
  // selector collection for datePicker
      const nowDate = '.now'
      const actualDate = '.actual'
      const datePickerArrowLeft = '.dpPrev'
      const datePickerArrowRight = '.dpNext'
      const randomFutureDate = 'tr:nth-child(3) > td:nth-child(4)'

  await page.waitForSelector(airFromDate)
  let airFromDateContent = await page.evaluate(el => el.innerText, await page.$(airFromDate))
  await page.waitForSelector(airToDate)
  let airToDateContent = await page.evaluate(el => el.innerText, await page.$(airToDate))
    console.log('√ default departure date is: ' + airFromDateContent)
    console.log('√ default arrival date is: ' + airToDateContent)
      await page.click(airFromDate)
      await page.waitForSelector(datePickerArrowRight)
      await page.click(datePickerArrowRight)
      await page.click(randomFutureDate)
      airFromDateContent = await page.evaluate(el => el.innerText, await page.$(airFromDate))
      airToDateContent = await page.evaluate(el => el.innerText, await page.$(airToDate))
        console.log('√ selected departure date is: ' + airFromDateContent)
        console.log('√ defaulted arrival date is: ' + airToDateContent)

/* await page.waitForSelector('.field > #air-out-date > div > #air-out-date-value > span')
  await page.click('.field > #air-out-date > div > #air-out-date-value > span')
  await page.waitForSelector('.datepicker > .dpBody > .dpMonth > .dpMonthHeader > .dpNext')
  await page.click('.datepicker > .dpBody > .dpMonth > .dpMonthHeader > .dpNext')

  await page.waitForSelector('table > tbody > tr > .hover > a')
  await page.click('table > tbody > tr > .hover > a')
*/
  // Then popup checkboxes appear below
  // And I disable popup checkboxes

  await page.waitForSelector(deselectComparesite)
  await page.click(deselectComparesite)
    console.log('√ checkboxes are deselected')

  // When I launch search
  await page.waitForSelector(airSubmit)
  await page.click(airSubmit)
    console.log('√ search is launched')





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
