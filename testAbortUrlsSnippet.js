const puppeteer = require('puppeteer')

async function abortSnippet () {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  // abort 3rd party content, source: https://github.com/GoogleChrome/puppeteer/blob/master/examples/block-images.js
  await page.setRequestInterception(true)
  page.on('request', interceptedRequest => {
    if (interceptedRequest.url().startsWith('https://cdn.ampproject.org') ||
      interceptedRequest.url().startsWith('https://ads.travelaudience.com') ||
      interceptedRequest.url().startsWith('https://tpc.googlesyndication.com') ||
      interceptedRequest.url().startsWith('https://www.google') ||
      interceptedRequest.url().startsWith('https://securepubads') ||
      interceptedRequest.url().startsWith('https://googleads') ||
      interceptedRequest.url().startsWith('https://csi.gstatic.com') ||
      interceptedRequest.url().startsWith('https://cm.travelaudience.com') ||
      interceptedRequest.url().startsWith('https://www.google-analytics.com') ||
      interceptedRequest.url().startsWith('https://mapping.nxtck.com') ||
      interceptedRequest.url().startsWith('https://pixel.advertising.com') ||
      interceptedRequest.url().startsWith('https://tag.yieldoptimizer.com') ||
      interceptedRequest.url().startsWith('https://eb2.3lift.com') ||
      interceptedRequest.url().startsWith('https://p.nxtck.com') ||
      interceptedRequest.url().startsWith('https://pixel.sojern.com') ||
      interceptedRequest.url().startsWith('https://pagead2') ||
      interceptedRequest.url().startsWith('https://bat.bing.com') ||
      interceptedRequest.url().startsWith('https://cm.g.doubleclick.net') ||
      interceptedRequest.url().startsWith('https://www.facebook.com') ||
      interceptedRequest.url().startsWith('https://images1.bovpg.net') ||
      interceptedRequest.url().startsWith('https://compare.liligo.com') ||
      interceptedRequest.url().startsWith('https://www.googleadservices.com') ||
      interceptedRequest.url().startsWith('https://s.yimg.com') ||
      interceptedRequest.url().startsWith('https://nxtck.com') ||
      interceptedRequest.url().startsWith('https://fonts.googleapis.com') ||
      interceptedRequest.url().startsWith('https://sslwidget.criteo.com') ||
      interceptedRequest.url().startsWith('https://pixel.rubiconproject.com')) {
      interceptedRequest.abort()
    } else {
      interceptedRequest.continue()
    }
  })
  await page.goto('http://liligo.fr')
  console.log('Hello, world')
  await browser.close()
}
abortSnippet()
