process.argv[3] = '1__2019.12.11.' // force cli argument like in case of --debug date=1__2019.12.11. to cover all conditions
const date = require('./date').date

describe('date', function() {
  test('should return valid date object', function() {
    expect(date).toBeTruthy()
    expect(date.todayDotSeparated).toBe('2019.12.11.')
    expect(date.today).toBe('1')
  })
})
