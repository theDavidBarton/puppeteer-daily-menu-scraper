// testing with Puppeteer example
const puppeteer = require('puppeteer');
const expect = require('expect');

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 40 })
  const page = await browser.newPage()
  const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 })

  await page.setViewport({ width: 1024, height: 768 })
    console.log('√ puppeteer has launched')

    /*
    | -----------------------------------
    | SELECTORS
    | -----------------------------------
    | selector collection
    */

      const airFrom             = '#air-from'
      const airTo               = '#air-to'
      const complocFirst        = '#liligo_cl2_item_0'
      const complocSecond       = '#liligo_cl2_item_1'
      const airFromDate         = '#air-out-date-value'
      const airToDate           = '#air-ret-date-value'
      const deselectComparesite = '.hp-searchform-comparesite-selectnone'
      const airSubmit           = '#air-submit'

  /*
  | GIVEN I am on the homepage
  */

  await page.goto('https://www.liligo.fr/', { waitUntil: 'networkidle2', timeout: 0 })
    console.log('√ page is loaded successfully with all its assets')

    /*
    | -----------------------------------
    | LOCATIONS
    | -----------------------------------
    | WHEN I set departure
    | AND I set arrival
    */

  await page.waitForSelector(airFrom)
  await page.click(airFrom)
  await page.keyboard.type('San f')
  await page.waitForSelector(complocFirst)
  await page.click(complocFirst)
  let airFromContent = await page.evaluate(el => el.value, await page.$(airFrom))
  expect(airFromContent).toBe('San Francisco,  CA, Etats-Unis (SFO)')
    console.log('√ departure is set ' + airFromContent)


  await page.keyboard.type('Par')
  await page.waitForSelector(complocSecond)
  await page.click(complocSecond)
  let airToContent = await page.evaluate(el => el.value, await page.$(airTo))
  expect(airToContent).toBe('Paris, France (CDG)')
    console.log('√ arrival is set ' + airToContent)


  /*
  | -----------------------------------
  | DATE PICKER
  | -----------------------------------
  | AND I set a new date
  */

      const nowDate              = '.now'
      const actualDate           = '.actual'
      const datePickerMonth1     = 'div.dpMonth.dpMonth1 .dpMonthHeader'
      const datePickerMonth2     = 'div.dpMonth.dpMonth2 .dpMonthHeader'
      const datePickerArrowLeft  = '.dpPrev'
      const datePickerArrowRight = '.dpNext'
      const randomFutureDate     = 'tr:nth-child(3) > td:nth-child(4)'

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
        airFromDateContent = await page.evaluate(el => el.innerText, await page.$(airFromDate)) // format: 18 Avr. 2019 (jeudi)
        airToDateContent = await page.evaluate(el => el.innerText, await page.$(airToDate))     // format: 25 Avr. 2019 (jeudi)
          console.log('√ selected departure date is: ' + airFromDateContent)
          console.log('√ selected arrival date is: ' + airToDateContent)
            // validates date selection
            await page.click(airFromDate)
            let airFromDateSelectedMonth = await page.evaluate(el => el.innerText, await page.$(datePickerMonth1))
            let airFromDateSelectedDay = await page.evaluate(el => el.innerText, await page.$(actualDate))
              let airFromDateSelected = airFromDateSelectedDay + ' ' + airFromDateSelectedMonth // format: 18 Avril, 2019
            console.log('----> departure day selected: ' + airFromDateSelected)
              expect(airFromDateContent).toMatch(/19/)
              console.log('√ airFrom contains "19" \n')
            await page.click(airToDate)
            let airToDateSelectedMonth = await page.evaluate(el => el.innerText, await page.$(datePickerMonth1))
            let airToDateSelectedDay = await page.evaluate(el => el.innerText, await page.$(actualDate))
              let airToDateSelected = airToDateSelectedDay + ' ' + airToDateSelectedMonth     // format: 25 Avril, 2019
            console.log('----> arrival day selected: ' + airToDateSelected)
              expect(airToDateContent).toMatch(/19/)
              console.log('√ airTo contains "19" \n')

            // clickouts from datePicker
            await page.click('.hp-searcharea') // the searchform's background

  // THEN popup checkboxes appear below
  // AND I disable popup checkboxes

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
