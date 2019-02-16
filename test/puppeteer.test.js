'use strict';

const assert = require('assert');
const koa = require('koa');
const serve = require('koa-static');
const findlinks = require('..');
const puppeteer = require('puppeteer');

describe('test/puppeteer.test.js', () => {

  let app;
  let server;
  before(done => {
    app = new koa();
    app.use(serve(__dirname + '/fixtures'));
    server = app.listen(3000, done);
  });
  after(done => server.close(done));

  it('should get result', async () => {
    const result = await findlinks({ src: 'http://127.0.0.1:3000', puppeteer, logger: console });
    assert.deepEqual(result, {
      count: 76,
      success: 74,
      fail: 2,
    });
  });

});
