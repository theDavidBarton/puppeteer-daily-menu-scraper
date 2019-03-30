# Puppeteer examples

A sandbox repository for the Node library **Puppeteer** (pptr) made by GoogleChromeLabs. See below the covered areas. The aim is to experiment with its possibilities for later projects.

The actual version of pptr is v1.14.0

### Fields to be covered

- scraping daily menus and print the output with webhooks to slack;
- automate user flows (e2e testing) with pptr;
- try out the experimental [Puppeteer-Firefox](https://aslushnikov.github.io/ispuppeteerfirefoxready/).

### Install packages

Node v7.6.0 or greater is needed to run the scripts in this repo. And v8.9.4 or greater to run puppeteer with Firefox.

via Yarn:
```shell_session
yarn add puppeteer
yarn add puppeteer-firefox
yarn add expect
```

via NPM:
```shell_session
npm install puppeteer
npm install puppeteer-firefox
npm install expect
```

### Run script

```shell_session
node test.js
node scrape-menu.js
```

If you'd want the scraper's console output to be saved for later usage then run:

```shell_session
node scrape-menu.js > tmp/output.txt
```

### Links

[The home of Puppeteer](https://pptr.dev)

[GitHub Puppeteer](https://github.com/GoogleChrome/puppeteer)

[Slightly better examples than mine](https://github.com/GoogleChromeLabs/puppeteer-examples)

[StackOverFlow](https://stackoverflow.com/questions/tagged/puppeteer)
