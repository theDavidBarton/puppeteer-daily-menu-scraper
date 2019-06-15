jest.setTimeout(30000)

const priceCatcher = require('./../lib/priceCatcher')
const mockedContent = [
  'Menu price is 1,200 ft today',
  'Menu price is 1.200Ft today',
  'Menu price is 1200 ft today',
  'Menu price is 1200,- ft today',
  'Menu price is 1 200 HUF today',
  'Menu price is 1\xa0200,00 Ft today',
  'Menu price is one thousand two hundred HUF today'
]
let textContentTest

describe('price catcher', function() {
  test('should catch 1,200 ft (comma as thousands separator)', function() {
    textContentTest = priceCatcher.priceCatcher(mockedContent[0])
    expect(textContentTest).toBe('1200')
  })
  test('should catch 1.200Ft (dot as thousands separator + no space between currency)', function() {
    textContentTest = priceCatcher.priceCatcher(mockedContent[1])
    expect(textContentTest).toBe('1200')
  })
  test('should catch 1200 ft (without thousands separator)', function() {
    textContentTest = priceCatcher.priceCatcher(mockedContent[2])
    expect(textContentTest).toBe('1200')
  })
  test('should catch 1200,- ft (with local currency delimiter)', function() {
    textContentTest = priceCatcher.priceCatcher(mockedContent[3])
    expect(textContentTest).toBe('1200')
  })
  test('should catch 1 200 HUF (space + international currency)', function() {
    textContentTest = priceCatcher.priceCatcher(mockedContent[4])
    expect(textContentTest).toBe('1200')
  })
  test('should catch 1\xa0200,00 Ft (non-breaking space + decimal separator)', function() {
    textContentTest = priceCatcher.priceCatcher(mockedContent[5])
    expect(textContentTest).toBe('1200')
  })
  test('should not catch one thousand two hundred HUF (text price)', function() {
    textContentTest = priceCatcher.priceCatcher(mockedContent[6])
    expect(textContentTest).toBe('n/a')
  })
  test('should not break function if input is empty (undefined)', function() {
    textContentTest = priceCatcher.priceCatcher(mockedContent[7]) // there is no such element of the object : undefined
    expect(textContentTest).toBe('n/a')
  })
})
