'use strict';

var lstat     = require('../lstat')
  , writeFile = require('../write-file')

  , testFile = require('path').resolve(__dirname, '__playground/unlink');

module.exports = function (t, a, d) {
	return writeFile(testFile, 'foo')(function () {
		return lstat(testFile)(function () {
			return t(testFile)(function () {
				return lstat(testFile)(a.never, function (err) {
					a(err.code, 'ENOENT');
					return t(testFile + 'bla', { loose: true }).catch(a.never);
				});
			});
		});
	}).done(d, d);
};
