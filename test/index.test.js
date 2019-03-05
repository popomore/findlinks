'use strict';

const assert = require('assert');
const koa = require('koa');
const serve = require('koa-static');
const findlinks = require('..');

describe('test/index.test.js', () => {

  let app;
  let server;
  before(done => {
    app = new koa();
    app.use(serve(__dirname + '/fixtures'));
    server = app.listen(3000, done);
  });
  after(done => server.close(done));

  it('should get result', async () => {
    const result = await findlinks({ src: 'http://127.0.0.1:3000' });
    assert.deepEqual(result, {
      count: 70,
      success: 68,
      fail: 2,
    });
  });

  it('should reset to function when info and error are not function', async () => {
    const result = await findlinks({ src: 'http://127.0.0.1:3000', logger: { error: '', info: '' } });
    assert.deepEqual(result, {
      count: 70,
      success: 68,
      fail: 2,
    });
  });

  it('should get result when request a noexist url', async () => {
    const result = await findlinks({ src: 'http://127.0.0.1:3000/noexist' });
    assert.deepEqual(result, {
      count: 1,
      success: 0,
      fail: 1,
    });
  });

  it('should request custom host which is configured in allowHost', async () => {
    const result = await findlinks({
      src: 'http://127.0.0.1:3000/custom.html',
      allowHost: [ 'cdn.jsdelivr.net' ],
      attributes: [
        [ 'script', 'src' ],
        [ 'link', 'href' ],
      ],
    });

    assert.deepEqual(result, {
      count: 4,
      success: 0,
      fail: 2,
    });
  });

});
