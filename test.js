    const puppeteer          = require('puppeteer');
    const puppeteerFirefox   = require('puppeteer-firefox');
    const expect             = require('expect');


(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 20 })
  const page = await browser.newPage()
  const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 }) // Firefox: remove "{ waitUntil: 'networkidle2', timeout: 0 }"

  await page.setViewport({ width: 1024, height: 768 })

    console.log('... puppeteer has launched')


/*
 -----------------------------------
 SELECTORS
 -----------------------------------
*/

      const urlHomepage          = 'http://www.liligo.fr/'
      const airFromTypeLetters   = 'San f'
      const airToTypeLetters     = 'Par'
      const airFromContentToBe   = 'San Francisco,  CA, Etats-Unis (SFO)'
      const airToContentToBe     = 'Paris, France (CDG)'

      const airFrom              = '#air-from'
      const airTo                = '#air-to'
      const complocFirst         = '#liligo_cl2_item_0'
      const complocSecond        = '#liligo_cl2_item_1'
      const airFromDate          = '#air-out-date-value'
      const airToDate            = '#air-ret-date-value'
      const deselectComparesite  = '.hp-searchform-comparesite-selectnone'
      const airSubmit            = '#air-submit'

      const nowDate              = '.now'
      const actualDate           = '.actual'
      const datePickerMonth1     = 'div.dpMonth.dpMonth1 .dpMonthHeader'
      const datePickerMonth2     = 'div.dpMonth.dpMonth2 .dpMonthHeader'
      const datePickerArrowLeft  = '.dpPrev'
      const datePickerArrowRight = '.dpNext'
      const randomFutureDate     = 'tr:nth-child(3) > td:nth-child(4)'

      const clickoutHome         = '.hp-searcharea' // the searchform's background on homepage
      const clickoutSeo          = '.sc-searchform'  // the searchform's background on SEO (sc)

      const resultDetailsButton  = '.travel-details-button'
      const cta                  = '.cta'


  await page.goto(urlHomepage , { waitUntil: 'networkidle2', timeout: 0 }) // Firefox: remove "{ waitUntil: 'networkidle2', timeout: 0 }"

/*
 -----------------------------------
 LOCATIONS
 -----------------------------------
*/

  await page.waitForSelector(airFrom)
// @ @ @ GHERKIN
    console.log('√ GIVEN I am on the homepage of ' + urlHomepage )

  await page.click(airFrom)
  await page.keyboard.type(airFromTypeLetters)
  await page.waitFor(1000)        // make sure dropdown opens
  await page.waitForSelector(complocFirst)
  await page.click(complocFirst)
  let airFromContent = await page.evaluate(el => el.value, await page.$(airFrom))
  expect(airFromContent).toBe(airFromContentToBe)
// @ @ @ GHERKIN
    console.log('√ WHEN I set departure to ' + airFromContent)

  await page.keyboard.type(airToTypeLetters)
  await page.waitFor(1000)
  await page.waitForSelector(complocSecond)
  await page.click(complocSecond)
  let airToContent = await page.evaluate(el => el.value, await page.$(airTo))
  expect(airToContent).toBe(airToContentToBe)
// @ @ @ GHERKIN
    console.log('√ AND I set destination to ' + airToContent)

  // prepare arrays from route location elements for result page validation
  // expected format: [ 'San Francisco', ' CA', 'Etats-Unis (SFO)' ]
  let airFromContentArray = airFromContent.split(', ')
  let airToContentArray = airToContent.split(', ')
/*
 -----------------------------------
 DATE PICKER
 -----------------------------------
*/

  await page.waitForSelector(airFromDate)
  let airFromDateContent = await page.evaluate(el => el.innerText, await page.$(airFromDate))
  await page.waitForSelector(airToDate)
  let airToDateContent = await page.evaluate(el => el.innerText, await page.$(airToDate))
// @ @ @ GHERKIN
    console.log('√ AND default departure date is: ' + airFromDateContent)
    console.log('√ AND default return date is: ' + airToDateContent)

      await page.click(airFromDate)
      await page.waitForSelector(datePickerArrowRight)
      await page.click(datePickerArrowRight)
      await page.click(randomFutureDate)
        airFromDateContent = await page.evaluate(el => el.innerText, await page.$(airFromDate)) // format: 18 Avr. 2019 (jeudi)
        airToDateContent = await page.evaluate(el => el.innerText, await page.$(airToDate))     // format: 25 Avr. 2019 (jeudi)
// @ @ @ GHERKIN
          console.log('√ AND I select departure date: ' + airFromDateContent)
          console.log('√ THEN selected return date is: ' + airToDateContent)

            // validates date selection
            await page.click(airFromDate)
            let airFromDateSelectedMonth = await page.evaluate(el => el.innerText, await page.$(datePickerMonth1))
            let airFromDateSelectedDay = await page.evaluate(el => el.innerText, await page.$(actualDate))
              let airFromDateSelected = airFromDateSelectedDay + ' ' + airFromDateSelectedMonth // format: 18 Avril, 2019

                let airFromDateContentArray = airFromDateSelected.split(' ')
                  console.log(airFromDateContentArray)
// @ @ @ GHERKIN
            console.log('   ----> departure day selected by me: ' + airFromDateSelected)

              expect(airFromDateContentArray).toContain(airFromDateSelectedDay)
// @ @ @ GHERKIN
              console.log('        √ departure field contains the selected day: ' + airFromDateSelectedDay)


            await page.click(airToDate)
            let airToDateSelectedMonth = await page.evaluate(el => el.innerText, await page.$(datePickerMonth1))
            let airToDateSelectedDay = await page.evaluate(el => el.innerText, await page.$(actualDate))
              let airToDateSelected = airToDateSelectedDay + ' ' + airToDateSelectedMonth     // format: 25 Avril, 2019

                let airToDateContentArray = airToDateSelected.split(' ')
                  console.log(airToDateContentArray)
// @ @ @ GHERKIN
            console.log('    ----> return day selected by me: ' + airToDateSelected)

              expect(airToDateContentArray).toContain(airToDateSelectedDay)
// @ @ @ GHERKIN
              console.log('        √ destination field contains the selected day: ' + airToDateSelectedDay)

/*
 -----------------------------------
 CLICKOUT (promise.race)
 -----------------------------------
*/

                await Promise.race([
                  page.waitForSelector(clickoutHome),
                  page.waitForSelector(clickoutSeo)
                ]);

                if (await page.$(clickoutHome) !== null) {
                    await page.click(clickoutHome)
// @ @ @ GHERKIN
                    console.log('√ AND I clickout from homepage searchform')
                  }
                else { await page.click(clickoutSeo)
// @ @ @ GHERKIN
                    console.log('√ AND I clickout from seo searchform')
                }

  await page.waitForSelector(deselectComparesite)
  await page.click(deselectComparesite)
// @ @ @ GHERKIN
    console.log('√ WHEN I deselect comparesites')

  await page.waitForSelector(airSubmit)
  await page.click(airSubmit)
// @ @ @ GHERKIN
    console.log('√ AND I launch search')

/*
 -----------------------------------
 RESULT PAGE
 -----------------------------------
*/

  await page.waitForSelector(resultDetailsButton)
// @ @ @ GHERKIN
    console.log('√ THEN resultpage appears')
    console.log('√ AND results appear')
        // source: https://github.com/GoogleChrome/puppeteer/issues/2859
        const departureHeaderSelector = (await page.$$('.results-header-city'))[0]
        const arrivalHeaderSelector = (await page.$$('.results-header-city'))[1]
        let departureHeaderContent = await page.evaluate(el => el.textContent, departureHeaderSelector)
        let arrivalHeaderContent = await page.evaluate(el => el.textContent, arrivalHeaderSelector)

      expect(departureHeaderContent).toBe(airFromContentArray[0])
// @ @ @ GHERKIN
        console.log('√ AND departure: ' + departureHeaderContent + ' from result header matches ' + airFromContentArray[0] + ' from homepage')

      expect(arrivalHeaderContent).toBe(airToContentArray[0])
// @ @ @ GHERKIN
        console.log('√ AND destination: ' + arrivalHeaderContent + ' from result header matches ' + airToContentArray[0] + ' from homepage')


// @ @ @ GHERKIN
      console.log('√ WHEN I click on result details')
  await page.click(resultDetailsButton)
// @ @ @ GHERKIN
      console.log('√ THEN result details appear')
  await navigationPromise

  await page.waitForSelector(cta)
  await page.click(cta)
// @ @ @ GHERKIN
      console.log('√ WHEN I click on an offer')
  await navigationPromise
// @ @ @ GHERKIN
      console.log('√ THEN I see a redirection to partner\'s site')
  await browser.close()
})()
