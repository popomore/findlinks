'use strict';

const urllib = require('urllib');
const chalk = require('chalk');
const url = require('url');
const cheerio = require('cheerio');
const assert = require('assert');
const getHTMLFromPuppeteer = require('./puppeteer');

const defaults = {
  src: '',
  logger: null,
  puppeteer: null,
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

    this.puppeteer = opt.puppeteer;
    this.srcHost = url.parse(opt.src).host;
    this.allowHost = [ this.srcHost ].concat(opt.allowHost);
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
    if (this.puppeteer) {
      this.browser = await this.puppeteer.launch();
    }

    await this._check(this.srcUrl);

    if (this.puppeteer) {
      try {
        await this.browser.close();
      } catch (_) {
        // nothing
      }
    }

    return this.result;
  }

  // refererUrl -> currentUrl -> linkUrl
  async _check(currentUrl, refererUrl) {
    this.urlCache.add(currentUrl);

    const { html, status } = await this._getHTML(currentUrl);

    if (status >= 300) {
      this.result.fail++;
      this.logger.error(chalk.red('#%s [%s] request %s, referer %s'),
        this.result.count++, status, currentUrl, refererUrl || '');
      return;
    }

    this.result.success++;
    this.logger.info(chalk.green('#%s [%s] request %s'), this.result.count++, status, currentUrl);

    const linkUrls = this._getUrls(html, currentUrl);
    for (const linkUrl of linkUrls) {
      if (!linkUrl) continue;
      const linkHost = url.parse(linkUrl).host;
      // ignore when it has cached or host is not allow
      if (!this.urlCache.has(linkUrl) && this.allowHost.includes(linkHost)) {
        await this._check(linkUrl, currentUrl);
      }
    }
  }

  async _getHTML(url) {
    const ret = await urllib.request(url, {
      timeout: 30 * 1000,
    });
    if (ret.status >= 300) {
      return { status: ret.status };
    }

    if (!this.browser) {
      return {
        status: ret.status,
        html: ret.data.toString(),
      };
    }

    const html = await getHTMLFromPuppeteer({
      url,
      browser: this.browser,
    });
    return { status: ret.status, html };
  }

  _getUrls(html, baseUrl) {
    const urls = [];
    for (const attribute of this.attributes) {
      // get links from attributes
      const $ = cheerio.load(html);
      $(attribute[0])
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
