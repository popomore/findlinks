'use strict';

const path = require('path');
const coffee = require('coffee');


describe('test/index.test.js', () => {

  it('should add prefix', () => {
    return coffee.fork(path.join(__dirname, '../index.js'))
    .debug()
    .expect('code', 0)
    .end();
  });

});
