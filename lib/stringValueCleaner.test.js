jest.setTimeout(30000)

const stringValueCleaner = require('./../lib/stringValueCleaner')

const testStringWithSpaces =
  'Weekly offer: soups          , fried chicken sandwitch     ,\nDaily menu: pizza with salad     goulash     , dessert     ice cream     .'
const testStringToReplace = 'Pénteki heti menü: tökfőzelék sóskával '
const testStringOCR = '          A mai menü: fostólt sclt 11ts hagvmás krump1.iptrével'

describe('string value cleaner', () => {
  test('should cleanup unnecessary spaces', async () => {
    const cleanedString = await stringValueCleaner.stringValueCleaner(testStringWithSpaces, false)
    expect(cleanedString).not.toContain(/\s\s+/)
  })
  test('should cleanup unnecessary spaces if OCR was enabled', async () => {
    const cleanedString = await stringValueCleaner.stringValueCleaner(testStringWithSpaces, true)
    expect(cleanedString).not.toContain(/\s\s+/)
  })
  test('should remove unneccesary patterns', async () => {
    const cleanedString = await stringValueCleaner.stringValueCleaner(testStringToReplace, false)
    expect(cleanedString).toBe('tökfőzelék sóskával')
  })
  test('should use replacement map on OCR-d string', async () => {
    const cleanedString = await stringValueCleaner.stringValueCleaner(testStringOCR, true)
    expect(cleanedString).toBe('a mai menü füstölt sült hús hagymás krumplipürével')
  })
  test('should return n/a if input is null', async () => {
    const cleanedStringNull = await stringValueCleaner.stringValueCleaner(null, false)
    expect(cleanedStringNull).toBe('n/a')
  })
  test('should remove specific words', async () => {
    const cleanedString = await stringValueCleaner.stringValueCleaner('Hétfő csirkepörkölt puding kedd', false)
    expect(cleanedString).toBe('csirkepörkölt puding')
  })
  test('should remove extra commas', async () => {
    const cleanedString = await stringValueCleaner.stringValueCleaner('Hétfő csirkepörkölt,,,,,,  puding,, kedd', false)
    expect(cleanedString).toBe('csirkepörkölt puding')
  })
})
