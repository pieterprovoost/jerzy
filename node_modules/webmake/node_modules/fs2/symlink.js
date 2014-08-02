'use strict';

var isCallable = require('es5-ext/object/is-callable')
  , isString   = require('es5-ext/string/is-string')
  , deferred   = require('deferred')
  , resolve    = require('path').resolve
  , original   = require('fs').symlink

  , symlink;

symlink = function (src, dest, options) {
	var def = deferred();
	original(src, dest, options.type, function (err) {
		if (err) {
			def.reject(err);
			return;
		}
		def.resolve();
	});
	return def.promise;
};
symlink.returnsPromise = true;

module.exports = exports = function (src, dest/*[, options[, callback]]*/) {
	var options, cb;

	src = resolve(String(src));
	dest = resolve(String(dest));
	options = arguments[2];
	cb = arguments[3];
	if ((cb == null) && isCallable(options)) {
		cb = options;
		options = {};
	} else {
		options = isString(options) ? { type: options } : Object(options);
	}

	return symlink(src, dest, options).cb(cb);
};
exports.returnsPromise = true;
exports.symlink = symlink;
