process.argv[3] = '1__2019.12.11.' // force cli argument like in case of --debug date=1__2019.12.11. to cover all conditions

const RestaurantMenuOutput = require('./restaurantMenuClasses').RestaurantMenuOutput
const RestaurantMenuDb = require('./restaurantMenuClasses').RestaurantMenuDb

describe('RestaurantMenuOutput class and RestaurantMenuDb class', function() {
  test('RestaurantMenuOutput should exist and should create new object', function() {
    expect(RestaurantMenuOutput).toBeTruthy()
    const testObj = new RestaurantMenuOutput(
      'red',
      'Example Restaurant',
      'www.github.com',
      './icon.png',
      'Soup Meat Drink',
      '1500',
      'HUF',
      'Ft',
      'Budapest, Heroes sqr. 1.'
    )
    expect(testObj.color).toBe('red')
    expect(testObj.author_name).toBe('EXAMPLE RESTAURANT') // w upperCase
    expect(testObj.author_link).toBe('www.github.com')
    expect(testObj.author_icon).toBe('./icon.png')
    expect(testObj.fields).toBeTruthy()
    expect(testObj.fields[0].title).toContain('Example Restaurant')
    expect(testObj.fields[0].value).toBe('Soup Meat Drink')
    expect(testObj.fields[0].short).toBe(false)
    expect(testObj.fields[1].title).toContain('HUF')
    expect(testObj.fields[1].value).toBe('1500Ft')
    expect(testObj.fields[1].short).toBe(true)
    expect(testObj.fields[2].title).toBeTruthy()
    expect(testObj.fields[2].value).toBe('Budapest, Heroes sqr. 1.')
    expect(testObj.fields[2].short).toBe(true)
    expect(testObj.footer).toBe('scraped by DailyMenu')
    expect(testObj.ts).toBeTruthy()
  })
  test('RestaurantMenuDb should exist and should create new object', function() {
    expect(RestaurantMenuDb).toBeTruthy()
    const testDbObj = new RestaurantMenuDb('Example Restaurant', '1500', 'HUF', 'Soup Meat Drink')
    expect(testDbObj.timestamp).toBeTruthy()
    expect(testDbObj.restaurant).toBe('Example Restaurant')
    expect(testDbObj.price).toBe('1500')
    expect(testDbObj.currency).toBe('HUF')
    expect(testDbObj.menuString).toBe('Soup Meat Drink')
  })
})
