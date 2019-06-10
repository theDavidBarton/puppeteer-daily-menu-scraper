[![Build Status](https://travis-ci.com/theDavidBarton/puppeteer-daily-menu-scraper.svg?branch=master)](https://travis-ci.com/theDavidBarton/puppeteer-daily-menu-scraper) [![codecov](https://img.shields.io/codecov/c/github/theDavidBarton/puppeteer-daily-menu-scraper/master.svg)](https://codecov.io/gh/theDavidBarton/puppeteer-daily-menu-scraper)


# Puppeteer Daily Menu Scraper

A sandbox repository for **Puppeteer** (pptr), the NodeJs library made by GoogleChromeLabs to interact with webapps and browser components through headless Chrome.

Currently the project's main js contains one headless Chrome instance with multiple async functions scraping daily and weekly menus (Monday to Friday) of restaurants from downtown Budapest (Hungary).

So far the scrapers are diverse: **(1)** harvests facebook posts for images, then OCR their content; **(2)** OCR menus uploaded in jpg image and table format; **(3)** scrape regular restaurant websites and get content via DOM and **(4)** also scraping facebook post texts based on regex patterns.

The final output is stored in JSON and posted to slack via webhooks.


###### KEYWORDS: [puppeteer](https://github.com/search?q=puppeteer) | [OCR](https://github.com/search?q=ocr) | [web scraping](https://github.com/search?q=web+scraping) | [facebook scraping](https://github.com/search?q=facebook+scraping) | [webhooks](https://github.com/search?q=webhooks)


### What can you find here?

- scraping daily menus and print the output with webhooks to slack;
- scraping facebook images and retrieve their content with OCR;
- trying out the experimental [Puppeteer-Firefox](https://aslushnikov.github.io/ispuppeteerfirefoxready/).

### Install packages

Node v7.6.0 or greater is needed to run the scripts in this repo. And v8.9.4 or greater to run puppeteer with Firefox. *Note:* ESlint has issues with some older Node versions. Guaranteed: **Node 10.15.3**


The actual version of pptr is v1.17.0

`yarn install` the project (everything is added as devDependencies in [package.json](/package.json))

### Environment variables

Create your own OCR API key and put in a file `app.env` (gitignored) in the root folder. Store the webhooks urls for slack per environment.

```shell_session
# create your API key here: https://ocr.space/ocrapi#free
export OCR_API_KEY="******************"
# slack webhooks
export WEBHOOK_URL_TEST=https://hooks.slack.com/services/*********/*********/************************
export WEBHOOK_URL_PROD=https://hooks.slack.com/services/*********/*********/************************

```

source the created file to local environment variables (depending on your environment you'll need to find a method which lasts more than the current session!):

```shell_session
$ source app.env
```

### Run scrapers

```shell_session
$ node scrapeDailyMenu.js
```

### Links

[The home of Puppeteer](https://pptr.dev)

[GitHub Puppeteer](https://github.com/GoogleChrome/puppeteer)

[Slightly better examples than mine](https://github.com/GoogleChromeLabs/puppeteer-examples)
