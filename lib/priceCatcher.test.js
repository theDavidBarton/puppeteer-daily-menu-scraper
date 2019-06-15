jest.setTimeout(30000)

const priceCatcher = require('./../lib/priceCatcher')
const mockedContent = [
  'Menu price is 1,200 ft today',
  'Menu price is 1.200 Ft today',
  'Menu price is 1200 ft today',
  'Menu price is 1200,- ft today',
  'Menu price is 1 200 HUF today',
  'Menu price is one thousand two hundred HUF today'
]
let textContentTest

describe('price catcher', function() {
  test('should catch 1,200 ft', function() {
    textContentTest = priceCatcher.priceCatcher(mockedContent[0])
    expect(textContentTest).toBe('1,200 ft')
  })
  test('should catch 1.200 Ft', function() {
    textContentTest = priceCatcher.priceCatcher(mockedContent[1])
    expect(textContentTest).toBe('1.200 Ft')
  })
  test('should catch 1200 ft', function() {
    textContentTest = priceCatcher.priceCatcher(mockedContent[2])
    expect(textContentTest).toBe('1200 ft')
  })
  test('should catch 1200,- ft', function() {
    textContentTest = priceCatcher.priceCatcher(mockedContent[3])
    expect(textContentTest).toBe('1200,- ft')
  })
  test('should catch 1 200 HUF', function() {
    textContentTest = priceCatcher.priceCatcher(mockedContent[4])
    expect(textContentTest).toBe('1 200 HUF')
  })
  test('should not catch one thousand two hundred HUF', function() {
    textContentTest = priceCatcher.priceCatcher(mockedContent[5])
    expect(textContentTest).toBe('n/a')
  })
})
