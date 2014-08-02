'use strict';

var indexTest  = require('tad/lib/utils/index-test')

  , dirPath = require('path').resolve(__dirname, '../../../lib/ignore-modes');

module.exports = indexTest(dirPath, ['tad']);
