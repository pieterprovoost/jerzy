'use strict';

var promisify = require('deferred').promisify
  , fs        = require('fs')
  , path      = require('path')

  , resolve = path.resolve
  , lstat = promisify(fs.lstat), unlink = promisify(fs.unlink)

  , root = resolve(__dirname, './__playground/symlink')
  , base = resolve(root, 'from')
  , regular = resolve(root, 'foo')
  , deep = resolve(root, 'foo/bar');

module.exports = function (t) {
	return {
		"Regular": {
			"Success": function (a, d) {
				t(base, regular)(function () {
					return lstat(regular)(function (stats) {
						a(stats.isSymbolicLink(), true);
						return unlink(regular);
					});
				}).done(d, d);
			},
			"Error": function (a, d) {
				t(base, deep)(a.never, function () {
					a.ok(true, "");
				}).done(d, d);
			}
		}
	};
};
