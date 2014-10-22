// fs.writeFile that's safe for simultaneous calls for same file.
// In such event write that is ongoing is exited and new one is initialized

'use strict';

var isCallable = require('es5-ext/object/is-callable')
  , isString   = require('es5-ext/string/is-string')
  , deferred   = require('deferred')
  , fs         = require('fs')
  , path       = require('path')
  , mkdir      = require('./mkdir').mkdir

  , dirname = path.dirname, resolve = path.resolve
  , next, writeAll, cache = {}, _writeFile, writeFile;

next = function (path, err, content, encoding) {
	var data = cache[path];
	if (err) {
		if (!cache[path].intermediate || (err.code !== 'ENOENT')) {
			delete cache[path];
			data.def.reject(err);
			return;
		}
		mkdir(dirname(path), { intermediate: true }).cb(function (err) {
			delete cache[path].intermediate;
			if (err) {
				next(path, err);
				return;
			}
			_writeFile(path, content, encoding);
		});
		return;
	}
	if (data.data) {
		data = data.data;
		delete cache[path].data;
		_writeFile(path, data.data, data.encoding);
	} else {
		delete cache[path];
		data.def.resolve();
	}
};

writeAll = function (path, fd, buffer, offset, length) {
	fs.write(fd, buffer, offset, length, offset, function (writeErr, written) {
		if (writeErr) {
			fs.close(fd, function () {
				next(path, writeErr);
			});
		} else {
			if ((written === length) || cache[path].data) {
				fs.close(fd, function (err) {
					next(path, err);
				});
			} else {
				writeAll(path, fd, buffer, offset + written, length - written);
			}
		}
	});
};

_writeFile = function (path, data, encoding) {
	if (!encoding) {
		encoding = 'utf8';
	}
	fs.open(path, 'w', 438, function (openErr, fd) {
		if (openErr) {
			next(path, openErr, data, encoding);
		} else if (!cache[path].data) {
			var buffer = Buffer.isBuffer(data) ? data : new Buffer(String(data),
				encoding);
			writeAll(path, fd, buffer, 0, buffer.length);
		} else {
			fs.close(fd, function (err) {
				next(path, err);
			});
		}
	});
};

writeFile = function (path, data, options) {
	var def, encoding = options.encoding || null;
	if (cache[path]) {
		if (!cache[path].intermediate && options.intermediate) {
			cache[path].intermediate = true;
		}
		cache[path].data = { data: data, encoding: encoding };
		def = cache[path].def;
	} else {
		def = deferred();
		cache[path] = { def: def, intermediate: options.intermediate };
		_writeFile(path, data, encoding);
	}

	return def.promise;
};
writeFile.returnsPromise = true;

module.exports = exports = function (path, data) {
	var cb, options;

	path = resolve(String(path));
	options = arguments[2];
	cb = arguments[3];
	if ((cb == null) && isCallable(options)) {
		cb = options;
		options = {};
	} else {
		options = isString(options) ? { encoding: options } : Object(options);
	}

	return writeFile(path, data, options).cb(cb);
};
exports.returnsPromise = true;
exports.writeFile = writeFile;
