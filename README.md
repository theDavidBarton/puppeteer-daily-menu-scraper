[![Build Status](https://travis-ci.com/theDavidBarton/puppeteer-daily-menu-scraper.svg?branch=master)](https://travis-ci.com/theDavidBarton/puppeteer-daily-menu-scraper)
[![codecov](https://img.shields.io/codecov/c/github/theDavidBarton/puppeteer-daily-menu-scraper/master.svg)](https://codecov.io/gh/theDavidBarton/puppeteer-daily-menu-scraper)
[![Dependency Status](https://david-dm.org/theDavidBarton/puppeteer-daily-menu-scraper.svg)](https://david-dm.org/)
[![crocodile](https://img.shields.io/badge/crocodiles_in_the_basement-%F0%9F%90%8A_yes-orange.svg)](/lib)
[![license](https://img.shields.io/github/license/theDavidBarton/puppeteer-daily-menu-scraper.svg)](/LICENSE.md)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FtheDavidBarton%2Fpuppeteer-daily-menu-scraper.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FtheDavidBarton%2Fpuppeteer-daily-menu-scraper?ref=badge_shield)

# Puppeteer Daily Menu Scraper

A sandbox repository for **Puppeteer** (pptr), the NodeJs library made by GoogleChromeLabs to interact with webapps and browser components through headless Chrome.

Currently the project's main js contains one headless Chrome instance with multiple async functions scraping daily and weekly menus (Monday to Friday) of restaurants from downtown Budapest (Hungary).

So far the scrapers are diverse: **(1)** harvests facebook posts for images, then OCR their content; **(2)** OCR menus uploaded in jpg image and table format; **(3)** scrape regular restaurant websites and get content via DOM and **(4)** also scraping facebook post texts based on regex patterns.

The final output is stored in JSON and posted to slack via webhooks.

###### KEYWORDS: [puppeteer](https://github.com/search?q=puppeteer) | [OCR](https://github.com/search?q=ocr) | [web scraping](https://github.com/search?q=web+scraping) | [facebook scraping](https://github.com/search?q=facebook+scraping) | [webhooks](https://github.com/search?q=webhooks)


### What can you do here?

- scrape daily menus and post the information with webhooks to slack;
- scrape images from facebook posts and retrieve their content with OCR.

### Install packages

[![pptr](https://img.shields.io/github/package-json/dependency-version/theDavidBarton/puppeteer-daily-menu-scraper/puppeteer.svg)](/package.json)
[![tested with jest](https://img.shields.io/static/v1.svg?label=tested%20with&message=jest&color=C21325)](https://github.com/facebook/jest)

`yarn install` the project (see dependencies in [package.json](/package.json))

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
$ node scrapeDailyMenu.js
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
