'use strict';

module.exports = async ({ browser, url, puppeteerRenderTimeout }) => {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: puppeteerRenderTimeout });
    return await page.content();
  } finally {
    await page.close();
  }
};
