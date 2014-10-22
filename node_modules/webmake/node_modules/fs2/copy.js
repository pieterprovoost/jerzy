// Copy file
// Credit: Isaac Schlueter
// http://groups.google.com/group/nodejs/msg/ef4de0b516f7d5b8

'use strict';

var isCallable = require('es5-ext/object/is-callable')
  , deferred   = require('deferred')
  , fs         = require('fs')

  , createReadStream = fs.createReadStream
  , createWriteStream = fs.createWriteStream

  , copy;

copy = function (source, dest, options) {
	var def = deferred(), read, write;

	try {
		read = createReadStream(source);
	} catch (e) {
		return def.reject(e);
	}
	try {
		write = createWriteStream(dest, options);
	} catch (e1) {
		read.destroy();
		return def.reject(e1);
	}

	read.on('error', function (e) {
		write.destroy();
		def.reject(e);
	});
	write.on('error', function (e) {
		read.destroy();
		def.reject(e);
	});
	read.pipe(write);
	write.on('close', def.resolve);

	return def.promise;
};
copy.returnsPromise = true;

module.exports = exports = function (source, dest/*, options, cb*/) {
	var options = Object(arguments[2]), cb = arguments[3];
	if ((cb == null) && isCallable(options)) {
		cb = options;
		options = {};
	}

	return copy(String(source), String(dest), options).cb(cb);
};
exports.copy = copy;
exports.returnsPromise = true;
