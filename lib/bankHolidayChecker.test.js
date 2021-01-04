const bankHolidayChecker = require('./../lib/bankHolidayChecker')

jest.mock('moment', () => () => ({ format: () => '2019-12-24' }))

describe('bank holiday checker', () => {
  test('should recognize christmas', () => {
    const bankHoliday = bankHolidayChecker.bankHolidayChecker()
    expect(bankHoliday).toBe(true)
  })
})
