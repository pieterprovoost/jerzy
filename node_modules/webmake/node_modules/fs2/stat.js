'use strict';

var deferred = require('deferred')
  , resolve  = require('path').resolve
  , original = require('fs').stat

  , stat;

stat = function (path) {
	var def = deferred();
	original(path, function (err, stats) {
		if (err) def.reject(err);
		else def.resolve(stats);
	});
	return def.promise;
};
stat.returnsPromise = true;

module.exports = exports = function (path/*, callback*/) {
	return stat(resolve(String(path))).cb(arguments[1]);
};
exports.returnsPromise = true;
exports.stat = stat;
