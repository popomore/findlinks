#!/usr/bin/env node

'use strict';

const findlinks = require('./index');

findlinks({ src: process.argv[2], logger: console })
  .then(result => console.info('Found %s links, %s of failed', result.count, result.fail))
  .catch(err => console.error(err.stack));
