# Puppeteer examples

A sandbox repository for **Puppeteer** (pptr), the NodeJs library made by GoogleChromeLabs to interact with webapps and browser components through headless Chrome.

The actual version of pptr is v1.15.0

### What can you find here?

- scraping daily menus and print the output with webhooks to slack;
- scraping images and retrieve their content with OCR;
- some fun NodeJs apps powered by data scraped from the web;
- automated user flows (e2e testing) with pptr and jest;
- try out the experimental [Puppeteer-Firefox](https://aslushnikov.github.io/ispuppeteerfirefoxready/).

### Install packages

Node v7.6.0 or greater is needed to run the scripts in this repo. And v8.9.4 or greater to run puppeteer with Firefox.

`yarn install` the project (everything is added as devDependencies in [package.json](/package.json))

### Environment variables

Create your own API key and put in a file `app.env` (gitignored) in the root folder:

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

### Run scripts

```shell_session
$ node scrapeDailyMenu.js
```

### Run tests with jest

Runs all the pptr tests with the ".test.js" name ending. Check the test runner settings in [package.json](/package.json) under "scripts".

```shell_session
$ yarn test
```

...or run a specific test, e.g.:

```shell_session
$ yarn test searchGoogleTranslate.test.js
```

### Links

[The home of Puppeteer](https://pptr.dev)

[GitHub Puppeteer](https://github.com/GoogleChrome/puppeteer)

[Slightly better examples than mine](https://github.com/GoogleChromeLabs/puppeteer-examples)

[StackOverFlow](https://stackoverflow.com/questions/tagged/puppeteer)
