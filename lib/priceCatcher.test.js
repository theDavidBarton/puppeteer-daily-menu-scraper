jest.setTimeout(30000)

const priceCatcher = require('./../lib/priceCatcher')
const mockedContent = [
  'Menu price is 1,200 ft today',
  'Menu price is 1.200Ft today',
  'Menu price is 1200 ft today',
  'Menu price is 1200,- ft today',
  'Menu price is 1 200 HUF today',
  'Menu price is 1\xa0200,00 Ft today',
  'Menu price is one thousand two hundred HUF today',
  'Menu prices are: 1000 Ft (soup) and 1200 Ft (main dish) today'
]

describe('price catcher', function() {
  test('should catch 1,200 ft (comma as thousands separator)', function() {
    let { price, priceCurrencyStr, priceCurrency } = priceCatcher.priceCatcher(mockedContent[0])
    expect(price).toBe('1200')
    expect(price + priceCurrencyStr).toBe('1200 Ft')
    expect(priceCurrency).toBe('HUF')
  })
  test('should catch 1.200Ft (dot as thousands separator + no space between currency)', function() {
    let { price, priceCurrencyStr, priceCurrency } = priceCatcher.priceCatcher(mockedContent[1])
    expect(price).toBe('1200')
    expect(price + priceCurrencyStr).toBe('1200 Ft')
    expect(priceCurrency).toBe('HUF')
  })
  test('should catch 1200 ft (without thousands separator)', function() {
    let { price, priceCurrencyStr, priceCurrency } = priceCatcher.priceCatcher(mockedContent[2])
    expect(price).toBe('1200')
    expect(price + priceCurrencyStr).toBe('1200 Ft')
    expect(priceCurrency).toBe('HUF')
  })
  test('should catch 1200,- ft (with local currency delimiter)', function() {
    let { price, priceCurrencyStr, priceCurrency } = priceCatcher.priceCatcher(mockedContent[3])
    expect(price).toBe('1200')
    expect(price + priceCurrencyStr).toBe('1200 Ft')
    expect(priceCurrency).toBe('HUF')
  })
  test('should catch 1 200 HUF (space + international currency)', function() {
    let { price, priceCurrencyStr, priceCurrency } = priceCatcher.priceCatcher(mockedContent[4])
    expect(price).toBe('1200')
    expect(price + priceCurrencyStr).toBe('1200 Ft')
    expect(priceCurrency).toBe('HUF')
  })
  test('should catch 1\xa0200,00 Ft (non-breaking space + decimal separator)', function() {
    let { price, priceCurrencyStr, priceCurrency } = priceCatcher.priceCatcher(mockedContent[5])
    expect(price).toBe('1200')
    expect(price + priceCurrencyStr).toBe('1200 Ft')
    expect(priceCurrency).toBe('HUF')
  })
  test('should not catch one thousand two hundred HUF (text price)', function() {
    let { price, priceCurrencyStr, priceCurrency } = priceCatcher.priceCatcher(mockedContent[6])
    expect(price).toBe('n/a')
    expect(price + priceCurrencyStr).toBe('n/a')
    expect(priceCurrency).toBe('n/a')
  })
  test('should catch the 2nd price from the string', function() {
    let { price, priceCurrencyStr, priceCurrency } = priceCatcher.priceCatcher(mockedContent[7], 1)
    expect(price).toBe('1200')
    expect(price + priceCurrencyStr).toBe('1200 Ft')
    expect(priceCurrency).toBe('HUF')
  })
  test('should not break function if input is empty (undefined)', function() {
    let { price, priceCurrencyStr, priceCurrency } = priceCatcher.priceCatcher(mockedContent[8]) // there is no such element of the object : undefined
    expect(price).toBe('n/a')
    expect(price + priceCurrencyStr).toBe('n/a')
    expect(priceCurrency).toBe('n/a')
  })
})
