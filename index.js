#!/usr/bin/env node

'use strict';

const co = require('co');
const Checker = require('./checker');

module.exports = co.wrap(findlinks);

function* findlinks(opt) {
  const checker = new Checker(opt);
  return yield checker.check();
}
