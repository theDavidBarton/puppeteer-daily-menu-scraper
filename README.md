[![Actions Status](https://github.com/theDavidBarton/puppeteer-daily-menu-scraper/workflows/CI/badge.svg)](https://github.com/theDavidBarton/puppeteer-daily-menu-scraper/actions)
[![codecov](https://img.shields.io/codecov/c/github/theDavidBarton/puppeteer-daily-menu-scraper/master.svg)](https://codecov.io/gh/theDavidBarton/puppeteer-daily-menu-scraper)
[![Dependency Status](https://david-dm.org/theDavidBarton/puppeteer-daily-menu-scraper.svg)](https://david-dm.org/)
[![crocodile](https://img.shields.io/badge/crocodiles_in_the_basement-%F0%9F%90%8A_yes-orange.svg)](/lib)
[![license](https://img.shields.io/github/license/theDavidBarton/puppeteer-daily-menu-scraper.svg)](/LICENSE.md)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FtheDavidBarton%2Fpuppeteer-daily-menu-scraper.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FtheDavidBarton%2Fpuppeteer-daily-menu-scraper?ref=badge_shield)

# Puppeteer Daily Menu Scraper

A sandbox repository for **Puppeteer** (pptr), the NodeJs library made by GoogleChromeLabs to interact with webapps and browser components through headless Chrome.

Currently the project's main js contains one headless Chrome instance with multiple async functions scraping daily and weekly menus (Monday to Friday) of restaurants from downtown Budapest (Hungary).

So far the scrapers are diverse: **(1)** harvests facebook posts for images, then OCR their content; **(2)** OCR menus uploaded in jpg image and table format; **(3)** scrape regular restaurant websites and get content via DOM and **(4)** also scraping facebook post texts based on regex patterns.

The final output is posted to slack via webhooks.

###### KEYWORDS: [puppeteer](https://github.com/search?q=puppeteer) | [OCR](https://github.com/search?q=ocr) | [web scraping](https://github.com/search?q=web+scraping) | [facebook scraping](https://github.com/search?q=facebook+scraping) | [webhooks](https://github.com/search?q=webhooks)

### What can you do here?

- scrape daily menus and post the information with webhooks to slack;
- scrape images from facebook posts and retrieve their content with OCR.

### Install packages

[![pptr](https://img.shields.io/github/package-json/dependency-version/theDavidBarton/puppeteer-daily-menu-scraper/puppeteer.svg)](/package.json)

`yarn install` the project.

### Environment variables

I.) touch an `app.env` file (gitignored) in the root folder. Create your own OCR Space API key; request user for the daily_menu mongoDB (or create your own and replace uri in the code to fit); and finally store the webhooks urls for slack per environment.

```bash
# create your API key here: https://ocr.space/ocrapi#free
export OCR_API_KEY="******************"

# mongoDb credentials
export MONGO_USERNAME="**************"
export MONGO_PASSWORD="**************"

# slack webhooks
export WEBHOOK_URL_TEST=https://hooks.slack.com/services/*********/*********/************************
export WEBHOOK_URL_PROD=https://hooks.slack.com/services/*********/*********/************************
```

II.) source the created file to local environment variables (depending on your platform you'll need to find a method which lasts more than the current session!):

```bash
$ source app.env
```

### Run scrapers

```bash
$ node ./src/dailyMenuScraper.js
```

or `yarn scrape`

_Note:_ a [cron job](https://github.com/theDavidBarton/puppeteer-daily-menu-scraper/actions?query=workflow%3Ascrape) is set up via GitHub Actions to run the node script at every weekday 10:20AM UTC! `'20 10 * * 1-5'`

### Run scrapers in debug mode

**I.)** `--debug` sends slack messages to WEBHOOK_URL_TEST so you are safe to do automated (or manual) e2e tests.

```bash
$ node ./src/dailyMenuScraper.js --debug
```

**II.)** `--debug --date=[0-6]__YYYY.MM.DD.` For debug purposes you are able to run script with a 2nd argument like below, where 2 means: day is Tuesday (0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday) and 2019.12.14. overrides the value of date.todayDotSeparated. You need to separate the two values by a double underscore '\_\_' !

```bash
$ node ./src/dailyMenuScraper.js --debug --date=2__2019.12.24.
```

or shorthand works as for run scrapers on prod: `yarn scrape --debug --date=2__2019.12.24.`

## API

```bash
$ node ./src/server.js
```

or `yarn start`

### Endpoints

- GET `/api/1/daily-menu/` => latest menu
- GET `/api/1/daily-menu/{YYYY-MM-DD}` => menu of the selected date

example: http://localhost:5000/api/1/daily-menu/2020-01-09

**succesful response:**

code: `200`

```json
[
   {
      "_id":"gdfgd55jk76k76k78l8jgdfsyc22",
      "timestamp":"2020.01.09.",
      "restaurant":"Karcsi Vendéglö",
      "price":"1100",
      "currency":"n/a",
      "menuString":"• Weekly offer: fokhagyma krémleves borzaska párolt rizzsel\n• Daily menu: korhely leves rozmaringos sertésragu leveszöldbab főzelék debrecenivel milánói sertésszelet"
   },
   {
      "_id":"gdfgd55jk76k76k78l8jgdfsyc23",
      "timestamp":"2020.01.09.",
      "restaurant":"Bistro Suppé",
      "price":"1190",
      "currency":"HUF",
      "menuString":"Orly bundában sült csirkemellfilé, jázminrizzsel a mai menünk\nLevesek - Lengyel kolbászos burgonyaleves - Gyömbéres csirkeleves - Sütőtök krémleves... Főzelékek - Sólet - Kelkáposzta "
   },
   {
      "_id":"gdfgd55jk76k76k78l8jgdfsyc24",
      "timestamp":"2020.01.09.",
      "restaurant":"Kamra Ételbár",
      "price":"1090",
      "currency":"HUF",
      "menuString":"• Daily menu: Zellerkrémleves, Bazsalikomos csirkés farfalle (1090.-Ft), Gombapaprikás tésztával (1100.-Ft), Rántott gomba tartárral körettel (1100.-Ft), Sajttal-sonkával töltött csibebatyu (1450.-Ft), Rántott csirkecomb petrezselymes burgonyával (1250.-Ft), Csőben sült fetás baconos csirkemell (1390.-Ft), Zúzapörkölt tarhonyával (1250.-Ft), Somlói galuska (650.-Ft), Feketeerdei sonkás gnocchi (1100.-Ft), Tejszines kapros piritott mogyorós csirkecsikok körettel (1250.-Ft), Gluténmentes főzelék: zöldborsó, tök, lencse (450.-Ft), Palermoi csirkemell paradicsomos rizzsel (1450.-Ft)"
   },
   {
      "_id":"gdfgd55jk76k76k78l8jgdfsyc25",
      "timestamp":"2020.01.09.",
      "restaurant":"Fruccola (Arany Janos utca)",
      "price":"2190",
      "currency":"HUF",
      "menuString":"• Daily menu: Fűszres mogyoróvajas zöldségleves, Szárított paradicsomos füstölt sajtos csirkemell rolád, mediterrán tepsis burgonya"
   },
   [...]
]
```

**error response:**

code: `404`

```json
{ "error": "no menu for the selected date!" }
```

# Links

[The home of Puppeteer](https://pptr.dev)

[GitHub Puppeteer](https://github.com/GoogleChrome/puppeteer)

[Slightly better examples than mine](https://github.com/GoogleChromeLabs/puppeteer-examples)

# License

[Apache License 2.0](/LICENSE.md)

Copyright 2019, David Barton (theDavidBarton)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

---

Dependency licenses: [NOTICE](/LICENSES.md)
