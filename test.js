// testing with Puppeteer example
const puppeteer = require('puppeteer');
const expect = require('expect');

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 20 })
  const page = await browser.newPage()
  const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 })

  await page.setViewport({ width: 1024, height: 768 })

    console.log('√ puppeteer has launched')


/*
 -----------------------------------
 SELECTORS
 -----------------------------------
 selector collection
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
 GIVEN I am on the homepage
*/

  await page.goto('https://www.liligo.fr/', { waitUntil: 'networkidle2', timeout: 0 })

    console.log('√ page is loaded successfully with all its assets')

/*
 -----------------------------------
 LOCATIONS
 -----------------------------------
 WHEN I set departure
 AND I set arrival
*/

  await page.waitForSelector(airFrom)
  await page.click(airFrom)
  await page.keyboard.type('San f')
  await page.waitFor(1000)        // make sure dropdown opens
  await page.waitForSelector(complocFirst)
  await page.click(complocFirst)
  let airFromContent = await page.evaluate(el => el.value, await page.$(airFrom))
  expect(airFromContent).toBe('San Francisco,  CA, Etats-Unis (SFO)')

    console.log('√ departure is set ' + airFromContent)


  await page.keyboard.type('Par')
  await page.waitFor(1000)
  await page.waitForSelector(complocSecond)
  await page.click(complocSecond)
  let airToContent = await page.evaluate(el => el.value, await page.$(airTo))
  expect(airToContent).toBe('Paris, France (CDG)')

    console.log('√ arrival is set ' + airToContent)


/*
 -----------------------------------
 DATE PICKER
 -----------------------------------
 AND I set a new date
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

// prepare arrays from route location eleemnts for result page validation
let airFromContentArray = airFromContent.split(', ')
console.log( airFromContentArray )
let airToContentArray = airToContent.split(', ')
console.log( airToContentArray )
/*
expected output format:

[ 'San Francisco', ' CA', 'Etats-Unis (SFO)' ]
[ 'Paris', 'France (CDG)' ]

*/

/*
 -----------------------------------
 CLICKOUT (promise.race)
 -----------------------------------
 AND I clickout from datePicker
*/

                const clickoutHome = '.hp-searcharea' // the searchform's background on homepage
                const clickoutSeo  = '.sc-searchform'  // the searchform's background on SEO (sc)


                await Promise.race([
                  page.waitForSelector(clickoutHome),
                  page.waitForSelector(clickoutSeo)
                ]);

                if (await page.$(clickoutHome) !== null) {
                    await page.click(clickoutHome)
                    console.log('"Wendy. I am home.""')
                  }
                else { await page.click(clickoutSeo)
                  console.log('"Wendy. I am SEO.""')
                }

  // THEN popup checkboxes appear below
  // AND I disable popup checkboxes

  await page.waitForSelector(deselectComparesite)
  await page.click(deselectComparesite)

    console.log('√ checkboxes are deselected')

  // WhHEN I launch search
  await page.waitForSelector(airSubmit)
  await page.click(airSubmit)

    console.log('√ search is launched')

/*
 -----------------------------------
 RESULT PAGE
 -----------------------------------
  THEN result page appears
  AND results appear
*/


// !!! possible solution, source: https://medium.com/@_edhuang/web-scraping-node-js-chrome-puppeteer-90b4d1a1d816 !!!

    const arrowHeader = '.results-header-arrow'

    await page.waitForSelector(arrowHeader)


    // !!! $$('.results-header-city')[0].textContent !!! "San Francisco"
    let departureHeaderContent = await page.evaluate(el => el.textContent, await page.$$('.results-header-city'))
    expect(departureHeaderContent).toBe(airFromContentArray[0])

      console.log('√ ' + departureHeaderContent + 'matches ' + airFromContentArray[0])

    let arrivalHeaderContent = await page.evaluate(el => el.textContent, await page.$$('.results-header-city'))
    expect(arrivalHeaderContent).toBe(airToContentArray[0])

      console.log('√ ' + arrivalHeaderContent + 'matches ' + airToContentArray[0])


  await page.waitForSelector('.travel-details-button')
  await page.click('.travel-details-button')
  await page.click('.travel-details-button')

  await navigationPromise

  await page.waitForSelector('.cta')
  await page.click('.cta')

  await navigationPromise

  await browser.close()
})()
