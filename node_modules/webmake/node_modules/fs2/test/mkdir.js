'use strict';

var promisify = require('deferred').promisify
  , fs        = require('fs')
  , path      = require('path')

  , dirname = path.dirname, resolve = path.resolve
  , lstat = promisify(fs.lstat), rmdir = promisify(fs.rmdir)

  , root = resolve(__dirname, './__playground/mkdir')
  , regular = resolve(root, 'foo')
  , existing = resolve(root, 'one')
  , deep = resolve(root, 'foo', 'bar');

module.exports = function (t) {
	return {
		"Regular": {
			"Success": function (a, d) {
				t(regular)(function () {
					return lstat(regular)(function (stats) {
						a(stats.isDirectory(), true);
						return rmdir(regular);
					});
				}).done(d, d);
			},
			"Error": function (a, d) {
				t(deep)(a.never, function () {
					a.ok(true, "");
				}).done(d, d);
			},
			"Existing": function (a, d) {
				t(existing)(a.never, function () {
					a.ok(true, "");
				}).done(d, d);
			}
		},
		"Intermediate": {
			"": function (a, d) {
				t(deep, { intermediate: true })(function () {
					return lstat(deep)(function (stats) {
						a(stats.isDirectory(), true);
						return rmdir(deep)(function () {
							return rmdir(dirname(deep));
						});
					});
				}).done(d, d);
			},
			"Existing": function (a, d) {
				t(existing, { intermediate: true })(function () {
					a.ok(true, "");
				}).done(d, d);
			}
		}
	};
};
