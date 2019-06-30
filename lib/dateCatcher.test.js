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
  'Menu between 2019. június 10. and 14. is...'
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
})
