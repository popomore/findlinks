'use strict';

const path = require('path');
const coffee = require('coffee');
const koa = require('koa');
const serve = require('koa-static');


describe('test/index.test.js', () => {

  let app;
  let server;
  before(done => {
    app = koa();
    app.use(serve(__dirname + '/fixtures'));
    server = app.listen(3000, done);
  });
  after(done => server.close(done));

  it('should add prefix', () => {
    return coffee.fork(path.join(__dirname, '../index.js'), [ 'http://127.0.0.1:3000' ])
    .debug()
    .expect('stdout', /#0 \[200] request http:\/\/127\.0\.0\.1:3000/)
    .expect('stderr', /#58 \[404] request http:\/\/127\.0\.0\.1:3000\/guide\/render-function, referer http:\/\/127.0.0.1:3000\/v2\/api/)
    .notExpect('stdout', /#api/)
    .expect('code', 0)
    .end();
  });

});
