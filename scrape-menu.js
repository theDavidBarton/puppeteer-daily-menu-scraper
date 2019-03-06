// scraping with Puppeteer example
const puppeteer = require('puppeteer');
const expect = require('expect');

(async () => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewport({ width: 1024, height: 768 })

  // abort all images, source: https://github.com/GoogleChrome/puppeteer/blob/master/examples/block-images.js
      await page.setRequestInterception(true)
      page.on('request', request => {
        if (request.resourceType() === 'image')
          request.abort()
        else
          request.continue()
        })

        // get Day of Week
        const today = new Date().getDay()
        var nameOfDay = today
          switch (nameOfDay) {
            case 1:
              let monday = 'MONDAY'
              let mLength = monday.length
              console.log('*' + monday + '* \n' + "=".repeat(mLength))
              break
              case 2:
                let tuesday = 'TUESDAY'
                let tuLength = tuesday.length
                console.log('*' + tuesday + '* \n' + "=".repeat(tuLength))
                break
                case 3:
                  let wednesday = 'WEDNESDAY'
                  let wLength = wednesday.length
                  console.log('*' + wednesday + '* \n' + "=".repeat(wLength))
                  break
                  case 4:
                    let thursday = 'THURSDAY'
                    let thLength = thursday.length
                    console.log('*' + thursday + '* \n' + "=".repeat(thLength))
                    break
                    case 5:
                      let friday = 'FRIDAY'
                      let fLength = friday.length
                      console.log('*' + friday + '* \n' + "=".repeat(fLength))
                      break
            default:
              let dflt = 'WHY ARE YOU WORKING TODAY?'
              let dfltLength = dflt.length
              console.log('*' + dflt + '* \n' + "=".repeat(dfltLength))
            }


  /*
  |------------------------------------------
  |              Yamato menu
  |------------------------------------------
  |  Address: Budapest, 1066, JÓKAI U. 30.
  |  Phone: +36(70)681-75-44
  |
  */
  let yamatoName = 'Yamato menu:'
  let yamatoLength = yamatoName.length
  console.log('*' + yamatoName + '* \n' + "-".repeat(yamatoLength))
  await page.goto('https://www.wasabi.hu/napimenu.php?source=yamato&lang=hu', { waitUntil: 'networkidle2', timout: 0 })
  // Monday
  const mondayYamato = await page.evaluate(el => el.innerText, await page.$('body > div > h6:nth-child(3)'))
  // Tuesday
  const tuesdayYamato = await page.evaluate(el => el.innerText, await page.$('body > div > h6:nth-child(5)'))
  // Wednesday
  const wednesdayYamato = await page.evaluate(el => el.innerText, await page.$('body > div > h6:nth-child(7)'))
  // Thursday
  const thursdayYamato = await page.evaluate(el => el.innerText, await page.$('body > div > h6:nth-child(9)'))
  // Friday
  const fridayYamato = await page.evaluate(el => el.innerText, await page.$('body > div > h6:nth-child(11)'))

  var nameOfDayYamato = today
  switch (nameOfDayYamato) {
    case 1:
      console.log('• Yamato Monday menu: ' + mondayYamato + '\n')
      break
      case  2:
        console.log('• Yamato Tuesday menu:' + tuesdayYamato + '\n')
        break
        case 3:
          console.log('• Yamato Wednesday menu:' + wednesdayYamato + '\n')
          break
          case 4:
            console.log('• Yamato Thursday menu:' + thursdayYamato + '\n')
            break
            case 5:
              console.log('• Yamato Friday menu:' + fridayYamato + '\n')
              break
    default:
    console.log(
      '• Yamato Monday menu: ' + mondayYamato + '\n' +
      '• Yamato Tuesday menu:' + tuesdayYamato + '\n' +
      '• Yamato Wednesday menu:' + wednesdayYamato + '\n' +
      '• Yamato Thursday menu:' + thursdayYamato + '\n' +
      '• Yamato Friday menu:' + fridayYamato + '\n'
    )
  }


  /*
  |------------------------------------------
  |               Cafe Vian menu
  |------------------------------------------
  |  Address: Budapest, Liszt Ferenc tér 9, 1061
  |  Phone: (1) 268 1154
  |
  */
  let vianName = 'Cafe vian menu:'
  let vianLength = vianName.length
  console.log('*' + vianName + '* \n' + "-".repeat(vianLength))
  await page.goto('http://www.cafevian.com/ebedmenue', { waitUntil: 'networkidle2', timeout: 0 })
  // stores src of given selector, source: https://stackoverflow.com/questions/52542149/how-can-i-download-images-on-a-page-using-puppeteer
  let linkSelectorVian = '#TPASection_jkic76naiframe'
  const linkVian = await page.evaluate((sel) => {
      return document.querySelector(sel).getAttribute('src')
  }, linkSelectorVian)

  await page.goto(linkVian, { waitUntil: 'networkidle2', timeout: 0 })
  // Monday
  const mondayVian1 = await page.evaluate(elefant => elefant.innerText, await page.$('#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(1) > div:nth-child(1) > div.heartyQ2riU'))
  const mondayVian2 = await page.evaluate(elefant => elefant.innerText, await page.$('#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(1) > div.hearty2QDOd > div > div > div.heartyQogjj > span'))
  // Tuesday
  const tuesdayVian1 = await page.evaluate(elefant => elefant.innerText, await page.$('#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(2) > div:nth-child(1) > div.heartyQ2riU'))
  const tuesdayVian2 = await page.evaluate(elefant => elefant.innerText, await page.$('#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(2) > div.hearty2QDOd > div > div > div.heartyQogjj > span'))
  // Wednesday
  const wednesdayVian1 = await page.evaluate(elefant => elefant.innerText, await page.$('#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(3) > div:nth-child(1) > div.heartyQ2riU'))
  const wednesdayVian2 = await page.evaluate(elefant => elefant.innerText, await page.$('#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(3) > div.hearty2QDOd > div > div > div.heartyQogjj > span'))
  // Thursday
  const thursdayVian1 = await page.evaluate(elefant => elefant.innerText, await page.$('#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(4) > div:nth-child(1) > div.heartyQ2riU'))
  const thursdayVian2 = await page.evaluate(elefant => elefant.innerText, await page.$('#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(4) > div.hearty2QDOd > div > div > div.heartyQogjj > span'))
  // Friday
  const fridayVian1 = await page.evaluate(elefant => elefant.innerText, await page.$('#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(5) > div:nth-child(1) > div.heartyQ2riU'))
  const fridayVian2 = await page.evaluate(elefant => elefant.innerText, await page.$('#mainDiv > div > div > div > div > div:nth-child(1) > div.hearty1fuYs > div:nth-child(5) > div.hearty2QDOd > div > div > div.heartyQogjj > span'))


  var nameOfDayVian = today
    switch (nameOfDayVian) {
      case 1:
        console.log('• Vian Monday menu: ' + mondayVian1 + ', ' + mondayVian2 + '\n')
        break
        case 2:
          console.log('• Vian Tuesday menu: ' + tuesdayVian1 + ', ' + tuesdayVian2 + '\n')
          break
          case 3:
            console.log('• Vian Wednesday menu: ' + wednesdayVian1 + ', ' + wednesdayVian2 + '\n')
            break
            case 4:
              console.log('• Vian Thursday menu: ' + thursdayVian1 + ', ' + thursdayVian2 + '\n')
              break
              case 5:
                console.log('• Vian Friday menu: ' + fridayVian1 + ', ' + fridayVian2 + '\n')
                break
      default:
      console.log(
        '• Vian Monday menu: ' + mondayVian1 + ', ' + mondayVian2 + '\n' +
        '• Vian Tuesday menu: ' + tuesdayVian1 + ', ' + tuesdayVian2 + '\n' +
        '• Vian Wednesday menu: ' + wednesdayVian1 + ', ' + wednesdayVian2 + '\n' +
        '• Vian Thursday menu: ' + thursdayVian1 + ', ' + thursdayVian2 + '\n' +
        '• Vian Friday menu: ' + fridayVian1 + ', ' + fridayVian2 + '\n'
      )
      }



  /*
  |------------------------------------------
  |               Korhely menu
  |------------------------------------------
  |  Address: Budapest, Liszt Ferenc tér 7, 1061
  |  Phone: (1) 321 0280
  |
  */
  let korhelyName = 'Korhely menu:'
  let korhelyLength = korhelyName.length
  console.log('*' + korhelyName + '* \n' + "-".repeat(korhelyLength))
  await page.goto('http://www.korhelyfaloda.hu/menu', { waitUntil: 'networkidle2', timeout: 0 })
  // stores src of given selector, source: https://stackoverflow.com/questions/52542149/how-can-i-download-images-on-a-page-using-puppeteer
  let linkSelectorKorhely = '#TPASection_ije2yufiiframe'
  const linkKorhely = await page.evaluate((sel) => {
      return document.querySelector(sel).getAttribute('src')
  }, linkSelectorKorhely)

  await page.goto(linkKorhely, { waitUntil: 'networkidle2', timeout: 0 })
   const weeklySummaryKorhely = await page.evaluate(el => el.innerText, await page.$('#mainDiv > div > div:nth-child(2) > section > div > div.MenusNavigation_description'))
   const weeklySoupKorhely = await page.evaluate(el => el.innerText, await page.$('#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(1)'))
   const weeklyMainKorhely = await page.evaluate(el => el.innerText, await page.$('#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(2)'))
   const weeklyDessertKorhely = await page.evaluate(el => el.innerText, await page.$('#mainDiv > div > div:nth-child(2) > section > ul > li:nth-child(3)'))


    console.log(
      '• Soups: ' + weeklySoupKorhely + '\n' +
      '• Main courses: ' + weeklyMainKorhely + '\n' +
      '• Desserts: ' + weeklyDessertKorhely + '\n'
    )



  /*
  |------------------------------------------
  |        Ketszerecsen bisztro menu
  |------------------------------------------
  |  Address: Budapest, Nagymező u. 14, 1065
  |  Phone: (1) 343 1984
  |
  */
  let ketszerecsenName = 'Ketszerecsen Bisztro menu:'
  let ketszerecsenLength = ketszerecsenName.length
  console.log('*' + ketszerecsenName + '* \n' + "-".repeat(ketszerecsenLength))
  await page.goto('https://ketszerecsen.hu/#daily', { waitUntil: 'networkidle2' })
  // Monday
  const mondayKetszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(5)'))
  const mondayKetszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(6)'))
  // Tuesday
  const tuesdayKetszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(8)'))
  const tuesdayKetszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(9)'))
  // Wednesday
  const wednesdayKetszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(11)'))
  const wednesdayKetszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(12)'))
  // Thursday
  const thursdayKetszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(14)'))
  const thursdayKetszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(15)'))
  // Friday
  const fridayKetszerecsen1 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(17)'))
  const fridayKetszerecsen2 = await page.evaluate(el => el.innerHTML, await page.$('p:nth-child(18)'))


  var nameOfDayKetszerecsen = today
    switch (nameOfDayKetszerecsen) {
      case 1:
        console.log('• Ketszerecsen Monday menu: ' + mondayKetszerecsen1 + ', ' + mondayKetszerecsen2 + '\n')
        break
        case 2:
          console.log('• Ketszerecsen Tuesday menu: ' + tuesdayKetszerecsen1 + ', ' + tuesdayKetszerecsen2 + '\n')
          break
          case 3:
            console.log('• Ketszerecsen Wednesday menu: ' + wednesdayKetszerecsen1 + ', ' + wednesdayKetszerecsen2 + '\n')
            break
            case 4:
              console.log('• Ketszerecsen Thursday menu: ' + thursdayKetszerecsen1 + ', ' + thursdayKetszerecsen2 + '\n')
              break
              case 5:
                console.log('• Ketszerecsen Friday menu: ' + fridayKetszerecsen1 + ', ' + fridayKetszerecsen2 + '\n')
                break
      default:
      console.log(
        '• Ketszerecsen Monday menu: ' + mondayKetszerecsen1 + ', ' + mondayKetszerecsen2 + '\n' +
        '• Ketszerecsen Tuesday menu: ' + tuesdayKetszerecsen1 + ', ' + tuesdayKetszerecsen2 + '\n' +
        '• Ketszerecsen Wednesday menu: ' + wednesdayKetszerecsen1 + ', ' + wednesdayKetszerecsen2 + '\n' +
        '• Ketszerecsen Thursday menu: ' + thursdayKetszerecsen1 + ', ' + thursdayKetszerecsen2 + '\n' +
        '• Ketszerecsen Friday menu: ' + fridayKetszerecsen1 + ', ' + fridayKetszerecsen2 + '\n'
      )
      }



  /*
  |------------------------------------------
  |     Fruccola (Arany Janos utca) menu
  |------------------------------------------
  |  Address: Budapest, Arany János u. 32, 1051
  |  Phone: (1) 430 6125
  |
  */
  let fruccolaName = 'Fruccola (Arany Janos utca) menu:'
  let fruccolaLength = fruccolaName.length
  console.log('*' + fruccolaName + '* \n' + "-".repeat(fruccolaLength))
  await page.goto('http://fruccola.hu/hu', { waitUntil : 'networkidle2' })
  const dailyFruccola1 = await page.evaluate(el => el.innerText, await page.$('#dailymenu-holder > li.arany.today > div.soup > p.description'))
  const dailyFruccola2 = await page.evaluate(el => el.innerText, await page.$('#dailymenu-holder > li.arany.today > div.main-dish > p.description'))


    console.log('• Fruccola daily menu: ' + dailyFruccola1 + ', ' + dailyFruccola2 + '\n')



  /*
  |------------------------------------------
  |            Kamra Etelbar menu
  |------------------------------------------
  |  Address: Budapest, Hercegprímás u. 19, 1051
  |  Phone: (20) 436 9968
  |
  */
  let kamraName = 'Kamra menu:'
  let kamraLength = kamraName.length
  console.log('*' + kamraName + '* \n' + "-".repeat(kamraLength))
  await page.goto('http://www.kamraetelbar.hu/kamra_etelbar_mai_menu.html', { waitUntil: 'networkidle2' })
  const dayKamra = await page.evaluate(el => el.innerText, await page.$('.shop_today_1'))

  // stores all elements with same ID, source: https://stackoverflow.com/questions/54677126/how-to-select-all-child-div-with-same-class-using-puppeteer
  const dailyKamra = await page.$$eval('.shop_today_title',
    divs => divs.map(({ innerText }) => innerText));


    console.log('• Kamra ' + dayKamra + ' daily menu: ' + dailyKamra + '\n')



  /*
  |------------------------------------------
  |            Roza menu
  |------------------------------------------
  |  Address: Budapest, Jókai u. 22, 1066
  |  Phone: (30) 611 4396
  |
  */
  let rozaName = 'Roza menu:'
  let rozaLength = rozaName.length
  console.log('*' + rozaName + '* \n' + "-".repeat(rozaLength))
  await page.goto('https://www.facebook.com/pg/rozafinomitt/posts/?ref=page_internal', { waitUntil: 'networkidle2' })
  const dailyRoza = await page.evaluate(el => el.innerText, await page.$('.text_exposed_show'))


    console.log('• Roza daily menu: ' + dailyRoza + '\n')



  /*
  |------------------------------------------
  |           Chagall Cafe menu
  |------------------------------------------
  |  Address: Budapest, Hajós u. 27, 1065
  |  Phone: (1) 302 4614
  |
  */
  let chagallName = 'Chagall menu:'
  let chagallLength = chagallName.length
  console.log('*' + chagallName + '* \n' + "-".repeat(chagallLength))
  await page.goto('http://chagallcafe.hu/?page_id=396', { waitUntil: 'networkidle2' })
  // Monday
  const mondayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(1) > div > ul > li > div > h4 > span.item_title'))
  // Tuesday
  const tuesdayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(2) > div > ul > li > div > h4 > span.item_title'))
  // Wednesday
  const wednesdayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(3) > div > ul > li > div > h4 > span.item_title'))
  // Thursday
  const thursdayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(4) > div > ul > li > div > h4 > span.item_title'))
  // Friday
  const fridayChagall = await page.evaluate(el => el.innerHTML, await page.$('#post-396 > section > div > section > div:nth-child(6) > div:nth-child(5) > div > ul > li > div > h4 > span.item_title'))


  var nameOfDayChagall = today
    switch (nameOfDayChagall) {
      case 1:
        console.log('• Chagall Monday menu: ' + mondayChagall + '\n')
        break
        case 2:
          console.log('• Chagall Tuesday menu: ' + tuesdayChagall + '\n')
          break
          case 3:
            console.log('• Chagall Wednesday menu: ' + wednesdayChagall + '\n')
            break
            case 4:
              console.log('• Chagall Thursday menu: ' + thursdayChagall + '\n')
              break
              case 5:
                console.log('• Chagall Friday menu: ' + fridayChagall + '\n')
                break
      default:
      console.log(
        '• Chagall Monday menu: ' + mondayChagall + '\n' +
        '• Chagall Tuesday menu: ' + tuesdayChagall + '\n' +
        '• Chagall Wednesday menu: ' + wednesdayChagall + '\n' +
        '• Chagall Thursday menu: ' + thursdayChagall + '\n' +
        '• Chagall Friday menu: ' + fridayChagall + '\n'
      )
      }



  /*
  |------------------------------------------
  |            Mozsar menu
  |------------------------------------------
  |  Address: Budapest, Nagymező u. 21, 1065
  |  Phone: (70) 426 8199
  |
  */
  let mozsarName = 'Mozsar menu:'
  let mozsarLength = mozsarName.length
  console.log('*' + mozsarName + '* \n' + "-".repeat(mozsarLength))
  await page.goto('http://mozsarbisztro.hu/index.php?p=3', { waitUntil: 'networkidle2' })
  // Monday
  const mondayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(1) > ul > li:nth-child(1) > label'))
  const mondayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(1) > ul > li:nth-child(2) > label'))
  // Tuesday
  const tuesdayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(2) > ul > li:nth-child(1) > label'))
  const tuesdayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(2) > ul > li:nth-child(2) > label'))
  // Wednesday
  const wednesdayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(3) > ul > li:nth-child(1) > label'))
  const wednesdayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(3) > ul > li:nth-child(2) > label'))
  // Thursday
  const thursdayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(4) > ul > li:nth-child(1) > label'))
  const thursdayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(4) > ul > li:nth-child(2) > label'))
  // Friday
  const fridayMozsar1 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(5) > ul > li:nth-child(1) > label'))
  const fridayMozsar2 = await page.evaluate(el => el.innerHTML, await page.$('#etlapresult > section:nth-child(5) > ul > li:nth-child(2) > label'))


  var nameOfDayMozsar = today
    switch (nameOfDayMozsar) {
      case 1:
        console.log('• Mozsár Monday menu: ' + mondayMozsar1 + ', ' + mondayMozsar2 + '\n')
        break
        case 2:
          console.log('• Mozsár Tuesday menu: ' + tuesdayMozsar1 + ', ' + tuesdayMozsar2 + '\n')
          break
          case 3:
            console.log('• Mozsár Wednesday menu: ' + wednesdayMozsar1 + ', ' + wednesdayMozsar2 + '\n')
            break
            case 4:
              console.log('• Mozsár Thursday menu: ' + thursdayMozsar1 + ', ' + thursdayMozsar2 + '\n')
              break
              case 5:
                console.log('• Mozsár Friday menu: ' + fridayMozsar1 + ', ' + fridayMozsar2 + '\n')
                break
      default:
      console.log(
        '• Mozsár Monday menu: ' + mondayMozsar1 + ', ' + mondayMozsar2 + '\n' +
        '• Mozsár Tuesday menu: ' + tuesdayMozsar1 + ', ' + tuesdayMozsar2 + '\n' +
        '• Mozsár Wednesday menu: ' + wednesdayMozsar1 + ', ' + wednesdayMozsar2 + '\n' +
        '• Mozsár Thursday menu: ' + thursdayMozsar1 + ', ' + thursdayMozsar2 + '\n' +
        '• Mozsár Friday menu: ' + fridayMozsar1 + ', ' + fridayMozsar2 + '\n'
      )
      }



  /*
  |------------------------------------------
  |         Karcsi vendeglo menu
  |------------------------------------------
  |  Address: Budapest, Jókai u. 20, 1066
  |  Phone: (1) 312 0557
  |
  */
  let karcsiName = 'Karcsi menu:'
  let karcsiLength = karcsiName.length
  console.log('*' + karcsiName + '* \n' + "-".repeat(karcsiLength))
  const weeklyKarcsi = 'http://karcsibacsivendeglo.com/letoltes/napi_menu.pdf'


  console.log('• Karcsi weekly menu: ' + weeklyKarcsi + '\n')



  /*
  |------------------------------------------
  |               Nokedli menu
  |------------------------------------------
  |  Address: Budapest, Weiner Leó u. 17, 1065
  |  Phone: (20) 499 5832
  |
  */
  let nokedliName = 'Nokedli menu:'
  let nokedliLength = nokedliName.length
  console.log('*' + nokedliName + '* \n' + "-".repeat(nokedliLength))
  await page.goto('http://nokedlikifozde.hu/', { waitUntil: 'networkidle2' })
  // stores src of given selector, source: https://stackoverflow.com/questions/52542149/how-can-i-download-images-on-a-page-using-puppeteer
  let imageSelector = '.aligncenter'
  const weeklyNokedly = await page.evaluate((sel) => {
      return document.querySelector(sel).getAttribute('src').replace('-300x212', '')
  }, imageSelector)


    console.log('• Nokedli weekly menu: ' + weeklyNokedly + '\n')



  await browser.close()
})()
