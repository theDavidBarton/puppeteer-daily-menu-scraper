jest.setTimeout(30000)

const stringValueCleaner = require('./../lib/stringValueCleaner')

const testStringWithSpaces =
  'Weekly offer: soups          , fried chicken sandwitch     ,\nDaily menu: pizza with salad     goulash     , dessert     ice cream     .'
const testStringOCR = '          Menü: fostólt sclt 11ts hagvmás krump1.iptrével'

describe('string value cleaner', function() {
  test('should cleanup unnecessary spaces', async function() {
    let cleanedString1 = await stringValueCleaner.stringValueCleaner(testStringWithSpaces, false)
    expect(cleanedString1).not.toContain(/\s\s+/)
  })
  test('should use replacement map on OCR-d string', async function() {
    let cleanedString2 = await stringValueCleaner.stringValueCleaner(testStringOCR, true)
    expect(cleanedString2).toBe('füstölt sült hús hagymás krumplipürével')
  })
  test('should return n/a if input is null', async function() {
    let cleanedStringNull = await stringValueCleaner.stringValueCleaner(null, false)
    expect(cleanedStringNull).toBe('n/a')
  })
})
