jest.setTimeout(30000)

const dateCatcher = require('./../lib/dateCatcher')

jest.mock('./../scrapeDailyMenu', () => ({
  get todayDotSeparated() {
    return '2019.06.19.'
  }
}))

const mockedContent = [
  'Menu for 2019. 06. 19. is the following...',
  'Menu for 2019. 06. 10. is the following...',
  'Menu for 2019-06-19 is the following...',
  'Menu between 2019. június 17. and 21. is...',
  'Menu between 2019. június 10. and 14. is...',
  'Menu between 2019.06.17. - 2019.06.21. is...',
  'Menu for 2019. 06.19. is the following...',
  '2019. 06.19.  - HÉTFÕKhao Soi levesSushi: Kani 2 nagy  maki tekercsCsípõs pirított  tészta pálcikás rákkalSzójababcsíra salátaBrownie2019. 06.20. - KEDDMiso levesSushi:  azac quinoa donPad thai rizs csirkévelEdamame babMatchateás sajttorta2019. 06.21. - SZERDAThai curry leves  rákkalSushi: Akasaka nagy maki tekercs 2dbBulgogi rizzselFügés   kecskesajt salátaMandulás túrógolyó2019. 06.22. - CSÜTÖRTÖKPho Bo 2019-06-22 .'
]
let found

describe('date catcher', function() {
  test('should catch 2019. 06. 19. (dot separated)', async function() {
    found = await dateCatcher.dateCatcher(mockedContent[0])
    expect(found).toBe(true)
  })
  test('should not catch 2019. 06. 10. (dot separated)', async function() {
    found = await dateCatcher.dateCatcher(mockedContent[1])
    expect(found).toBe(false)
  })
  test('should catch 2019-06-19 (dash separated)', async function() {
    found = await dateCatcher.dateCatcher(mockedContent[2])
    expect(found).toBe(true)
  })
  test('should throw error if promise rejects', async function() {
    found = await dateCatcher.dateCatcher(undefined).rejects
    expect(found).toBeUndefined()
  })
  test('should match interval if it is on the same week', async function() {
    found = await dateCatcher.dateCatcher(mockedContent[3], true)
    expect(found).toBe(true)
  })
  test('should not match interval if it is from previous week', async function() {
    found = await dateCatcher.dateCatcher(mockedContent[4], true)
    expect(found).toBe(false)
  })
  test('should match interval if it is on the same week (dot separated)', async function() {
    found = await dateCatcher.dateCatcher(mockedContent[5], true)
    expect(found).toBe(true)
  })
  test('should catch 2019. 06.19. (dot separated, mixed spacing)', async function() {
    found = await dateCatcher.dateCatcher(mockedContent[6])
    expect(found).toBe(true)
  })
  test('should catch 2019. 06.19. (dot separated, mixed spacing) in a longer text with multiple other dates', async function() {
    found = await dateCatcher.dateCatcher(mockedContent[7])
    expect(found).toBe(true)
  })
})
