'use strict';

const urllib = require('urllib');
const chalk = require('chalk');
const url = require('url');
const $ = require('cheerio');
const assert = require('assert');

const defaults = {
  src: '',
  logger: null,
  attributes: [
    // <a href=""></a>
    [ 'a', 'href' ],
  ],
};

class Checker {

  constructor(opt) {
    opt = Object.assign({}, defaults, opt);
    assert(opt.src, 'src should exists');
    this.srcUrl = opt.src;
    this.srcHost = url.parse(opt.src).host;
    this.attributes = opt.attributes;

    this.logger = getLogger(opt.logger);
    this.urlCache = new Set();
    this.result = {
      count: 0,
      success: 0,
      fail: 0,
    };
  }

  async check() {
    await this._check(this.srcUrl);
    return this.result;
  }

  // refererUrl -> currentUrl -> linkUrl
  async _check(currentUrl, refererUrl) {
    this.urlCache.add(currentUrl);

    const ret = await urllib.request(currentUrl, {
      timeout: 30 * 1000,
    });
    if (ret.status >= 300) {
      this.result.fail++;
      this.logger.error(chalk.red('#%s [%s] request %s, referer %s'),
        this.result.count++, ret.status, currentUrl, refererUrl || '');
      return;
    }

    this.result.success++;
    this.logger.info(chalk.green('#%s [%s] request %s'), this.result.count++, ret.status, currentUrl);

    const linkUrls = this._getUrls(ret.data.toString(), currentUrl);
    for (const linkUrl of linkUrls) {
      if (!linkUrl) continue;
      const linkHost = url.parse(linkUrl).host;
      // ignore when it has cached or has different host
      if (!this.urlCache.has(linkUrl) && this.srcHost === linkHost) {
        await this._check(linkUrl, currentUrl);
      }
    }
  }

  _getUrls(html, baseUrl) {
    const urls = [];
    for (const attribute of this.attributes) {
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

}

module.exports = Checker;

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

function getLogger(logger) {
  if (!logger) return { info: noop, error: noop };
  if (typeof logger.info !== 'function') logger.info = noop;
  if (typeof logger.error !== 'function') logger.error = noop;
  return logger;
}

function noop() {}
