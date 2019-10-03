jest.setTimeout(30000)

const objectDecider = require('./../lib/objectDecider')
let decision

describe('object decider', function() {
  test('should return true if content seems ok', async function() {
    decision = objectDecider.objectDecider('Burger, salad, coke')
    expect(decision).toBe(true)
  })
  test('should return false if content seems not ok', async function() {
    decision = objectDecider.objectDecider(null)
    expect(decision).toBe(false)
  })
  test('should return false if content seems not ok', async function() {
    decision = objectDecider.objectDecider('• Daily menu: ♪"No Milk Today"♫')
    expect(decision).toBe(false)
  })
})
