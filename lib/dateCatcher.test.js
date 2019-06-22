jest.setTimeout(30000)

const dateCatcher = require('./../lib/dateCatcher')

jest.mock('./../scrapeDailyMenu', () => ({
  get todayDotSeparated() {
    return '2019.06.17.'
  }
}))

const mockedContent = [
  'Menu for 2019. 06. 17. is the following...',
  'Menu for 2019. 06. 10. is the following...',
  'Menu for 2019-06-10 is the following...'
]
let found

describe('date catcher', function() {
  test('should catch 2019. 06. 17. (dot separated)', async function() {
    found = await dateCatcher.dateCatcher(mockedContent[0])
    expect(found).toBe(true)
  })
  test('should not catch 2019. 06. 10. (dot separated)', async function() {
    found = await dateCatcher.dateCatcher(mockedContent[1])
    expect(found).toBe(false)
  })
  test('should catch 2019-06-17 (dash separated)', async function() {
    found = await dateCatcher.dateCatcher(mockedContent[0])
    expect(found).toBe(true)
  })
  test('should throw error if promise rejects', async function() {
    found = await dateCatcher.dateCatcher(undefined).rejects
    expect(found).toBeUndefined()
  })
})
