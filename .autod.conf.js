'use strict';

module.exports = {
  write: true,
  prefix: '^',
  devprefix: '^',
  exclude: [
    'test/fixtures',
  ],
  devdep: [
    'autod',
    'egg-bin',
    'egg-ci',
    'eslint',
    'eslint-config-egg',
  ],
  keep: [
  ],
  semver: [
    'egg-bin@1',
    'koa@1',
    'koa-static@2',
    'cheerio@0',
  ],
};
