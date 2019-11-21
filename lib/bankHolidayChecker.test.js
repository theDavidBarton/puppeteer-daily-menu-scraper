const bankHolidayChecker = require('./../lib/bankHolidayChecker')

jest.mock('moment', () => () => ({ format: () => '2019-12-24' }))

describe('bank holiday checker', function() {
  test('should recognize christmas', function() {
    let bankHoliday = bankHolidayChecker.bankHolidayChecker()
    expect(bankHoliday).toBe(true)
  })
})
