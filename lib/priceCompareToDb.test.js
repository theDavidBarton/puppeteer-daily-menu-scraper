jest.setTimeout(30000)

const priceCompareToDb = require('./../lib/priceCompareToDb')
/*
jest.mock('./priceCompareToDb.js', () => ({
  get prevPrice() {
    return 14100
  }
}))
*/

describe('price comparer', function() {
  test('should respond with ▲ if price increased', async function() {
    let trendIncrease = await priceCompareToDb.priceCompareToDb('Kata (Chagall)', 1850)
    expect(trendIncrease).toBe('▲')
  })
  test('should respond with ▼ if price decreased', async function() {
    let trendDecrease = await priceCompareToDb.priceCompareToDb('Kata (Chagall)', 1050)
    expect(trendDecrease).toBe('▼')
  })
  test('should respond with empty string if price is the same', async function() {
    let trendStable = await priceCompareToDb.priceCompareToDb('Kata (Chagall)', 1750)
    expect(trendStable).toBe('')
  })
  test('should catch exceptions', async function() {
    let trendRejects = await priceCompareToDb.priceCompareToDb(undefined, undefined).rejects
    expect(trendRejects).toBe(undefined)
  })
})
