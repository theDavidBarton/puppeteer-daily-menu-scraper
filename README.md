# Puppeteer Daily Menu Scraper

A sandbox repository for **Puppeteer** (pptr), the NodeJs library made by GoogleChromeLabs to interact with webapps and browser components through headless Chrome.

Currently the project's main js contains one headless Chrome instance with multiple async functions scraping daily and weekly menus (Monday to Friday) of restaurants from downtown of Budapest (Hungary).
So far the scrapers are diverse: (1) harvests facebook posts for images, then OCR their content; (2) OCR menus uploaded in jpg image and table format; (3) scrape regular restaurant websites and get content via DOM and also scraping facebook post texts based on regex patterns.
The final output is stored in JSON and posted to slack via webhooks.

The actual version of pptr is v1.16.0

### What can you find here?

- scraping daily menus and print the output with webhooks to slack;
- scraping facebook images and retrieve their content with OCR;
- trying out the experimental [Puppeteer-Firefox](https://aslushnikov.github.io/ispuppeteerfirefoxready/).

### Install packages

Node v7.6.0 or greater is needed to run the scripts in this repo. And v8.9.4 or greater to run puppeteer with Firefox. *Note:* ESlint has issues with some older Node versions.

`yarn install` the project (everything is added as devDependencies in [package.json](/package.json))

### Environment variables

Create your own API key and put in a file `app.env` (gitignored) in the root folder. The same applies for the webhook urls for slack.

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

[StackOverFlow](https://stackoverflow.com/questions/tagged/puppeteer)
