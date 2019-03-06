# Puppeteer examples

A playground repository for the well known Node library **Puppeteer** (pptr) made by GoogleChromeLabs team. Some use cases will be available (see below), also the puppeteer recorder projects outputs will be checked against the stable version of pptr.

The current version is v1.12.2.

### Fields to be covered
- scraping web with pptr;
- automate user flows (e2e testing) with pptr.

### Install packages

You will need Node v7.6.0 or greater to run the scripts in this repo.

via Yarn:
```shell_session
yarn add puppeteer
yarn add expect
```

via NPM:

```shell_session
npm install puppeteer
npm install expect
```

### Run script

```shell_session
node test.js
node scrape-menu.js
```

If you'd want the scraper's console output save for later then run:

```shell_session
node scrape-menu.js > tmp/output.txt
```

### Links

[The home of Puppeteer](https://pptr.dev)

[GitHub Puppeteer](https://github.com/GoogleChrome/puppeteer)

[Slightly better examples than mine](https://github.com/GoogleChromeLabs/puppeteer-examples)

[Keep this file fancy (Markdown Cheatsheet)](https://help.github.com/en/articles/basic-writing-and-formatting-syntax)

[StackOverFlow](https://stackoverflow.com/questions/tagged/puppeteer)

---

Last edit: *6th March 2019*
