'use strict';

var deferred = require('deferred')
  , resolve  = require('path').resolve
  , original = require('fs').rename

  , rename;

rename = function (oldPath, newPath) {
	var def = deferred();
	original(oldPath, newPath, function (err) {
		if (err) def.reject(err);
		else def.resolve();
	});
	return def.promise;
};
rename.returnsPromise = true;

module.exports = exports = function (oldPath, newPath/*, callback*/) {
	return rename(resolve(String(oldPath)),
		resolve(String(newPath))).cb(arguments[2]);
};
exports.returnsPromise = true;
exports.rename = rename;
