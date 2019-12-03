const date = require('./../scrapeDailyMenu').date

// class for menu object
class RestaurantMenuOutput {
  constructor(color, title, url, icon, value, price, currency, priceCurrency, address) {
    this.color = color
    this.author_name = title.toUpperCase()
    this.author_link = url
    this.author_icon = icon
    this.fields = [
      {
        title: title + ' menu (' + date.dayNames[date.today] + '):',
        value: value,
        short: false
      },
      {
        title: 'price (' + currency + ')',
        value: price + priceCurrency,
        short: true
      },
      {
        title: 'address',
        value: address,
        short: true
      }
    ]
    this.footer = 'scraped by DailyMenu'
    this.ts = Math.floor(Date.now() / 1000)
  }
}

// class for database object
class RestaurantMenuDb {
  constructor(titleString, priceString, priceCurrency, valueString) {
    this.timestamp = date.todayDotSeparated
    this.restaurant = titleString
    this.price = priceString
    this.currency = priceCurrency
    this.menuString = valueString
  }
}

module.exports = { RestaurantMenuOutput, RestaurantMenuDb }
