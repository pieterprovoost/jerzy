'use strict';

var deferred = require('deferred')
  , resolve  = require('path').resolve
  , original = require('fs').lstat

  , lstat;

lstat = function (path) {
	var def = deferred();
	original(path, function (err, stats) {
		if (err) def.reject(err);
		else def.resolve(stats);
	});
	return def.promise;
};
lstat.returnsPromise = true;

module.exports = exports = function (path/*, callback*/) {
	return lstat(resolve(String(path))).cb(arguments[1]);
};
exports.returnsPromise = true;
exports.lstat = lstat;
