'use strict';

var deferred = require('deferred')
  , resolve  = require('path').resolve
  , original = require('fs').chmod

  , chmod;

chmod = function (path, mode) {
	var def = deferred();
	original(path, mode, function (err, stats) {
		if (err) def.reject(err);
		else def.resolve(stats);
	});
	return def.promise;
};
chmod.returnsPromise = true;

if (process.platform === 'win32') {
	module.exports = null;
} else {
	module.exports = exports = function (path, mode/*, callback*/) {
		return chmod(resolve(String(path)), mode).cb(arguments[2]);
	};
	exports.returnsPromise = true;
	exports.chmod = chmod;
}
