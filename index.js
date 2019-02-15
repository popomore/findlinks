#!/usr/bin/env node

'use strict';

const Checker = require('./checker');

module.exports = findlinks;

async function findlinks(opt) {
  const checker = new Checker(opt);
  return await checker.check();
}
