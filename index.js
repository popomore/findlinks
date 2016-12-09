#!/usr/bin/env node

'use strict';

const urllib = require('urllib');
const chalk = require('chalk');
const url = require('url');
const $ = require('cheerio');
const co = require('co');


const srcUrl = process.argv[2];
const srcHost = url.parse(srcUrl).host;
const urlCache = new Set();
const attributes = [
  // <a href=""></a>
  [ 'a', 'href' ],
];
let count = 0;

co(function* () {
  yield check(srcUrl);
}).catch(err => console.error(err.stack));

// refererUrl -> currentUrl -> linkUrl
function* check(currentUrl, refererUrl) {
  const ret = yield urllib.request(currentUrl, {
    followRedirect: true,
    timeout: 30 * 1000,
  });
  urlCache.add(currentUrl);
  if (ret.status >= 300) {
    console.error(chalk.red('#%s [%s] request %s, referer %s'),
      count++, ret.status, currentUrl, refererUrl || '');
    return;
  }
  console.info(chalk.green('#%s [%s] request %s'), count++, ret.status, currentUrl);

  const linkUrls = getUrls(ret.data.toString(), currentUrl);
  for (const linkUrl of linkUrls) {
    if (!linkUrl) continue;
    const linkHost = url.parse(linkUrl).host;
    // ignore when it has cached or has different host
    if (!urlCache.has(linkUrl) && srcHost === linkHost) {
      yield check(linkUrl, currentUrl);
    }
  }
}

function getUrls(html, baseUrl) {
  const urls = [];
  for (const attribute of attributes) {
    // get links from attributes
    $(html)
    .find(attribute[0])
    .each(function(_, ele) {
      let url = $(ele).attr(attribute[1]);
      url = resolveUrl(url, baseUrl);
      urls.push(url);
    });
  }
  return urls;
}

function resolveUrl(src, base) {
  if (!src) return '';
  if (!/^http/.test(src)) {
    // http://localhost/a + ./b > http://localhost/b
    src = url.resolve(base, src);
  }
  // remove #hash
  const tmp = url.parse(src);
  tmp.hash = '';
  return url.format(tmp);
}
