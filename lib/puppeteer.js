'use strict';

module.exports = async ({ browser, url }) => {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
    return await page.content();
  } finally {
    await page.close();
  }
};
