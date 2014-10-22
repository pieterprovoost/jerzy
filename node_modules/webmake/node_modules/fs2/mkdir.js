// Internal logic inspired by substack's node-mkdirp:
// https://github.com/substack/node-mkdirp/

'use strict';

var isNumber   = require('es5-ext/number/is-number')
  , isCallable = require('es5-ext/object/is-callable')
  , deferred   = require('deferred')
  , fs         = require('fs')
  , path       = require('path')

  , stat = fs.stat, original = fs.mkdir
  , dirname = path.dirname, resolve = path.resolve

  , _mkdir, mkdir;

_mkdir = function (path, options, resolve, reject) {
	original(path, options.mode, function (err) {
		var dir;
		if (err == null) {
			resolve(null);
			return;
		}
		if (!options.intermediate) {
			reject(err);
			return;
		}
		if (err.code === 'ENOENT') {
			dir = dirname(path);
			if (dir === path) {
				reject(err);
				return;
			}
			_mkdir(dir, options, function () {
				_mkdir(path, options, resolve, reject);
			}, reject);
		} else {
			stat(path, function (statErr, stats) {
				if (statErr || !stats.isDirectory()) reject(err);
				else resolve(null);
			});
		}
	});
};
mkdir = function (path, options) {
	var def = deferred();
	_mkdir(path, options, def.resolve, def.reject);
	return def.promise;
};
mkdir.returnsPromise = true;

module.exports = exports = function (path/*, mode|options, cb*/) {
	var options, cb;

	path = resolve(String(path));
	options = arguments[1];
	cb = arguments[2];

	if ((cb == null) && isCallable(options)) {
		cb = options;
		options = {};
	} else {
		options = isNumber(options) ? { mode: options } : Object(options);
	}

	return mkdir(path, options).cb(cb);
};
exports.returnsPromise = true;
exports.mkdir = mkdir;
