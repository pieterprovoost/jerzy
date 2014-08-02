// Whether passed error is error thrown by require in case module
// (at given path) is not found

'use strict';

var constant = require('es5-ext/function/constant')

  , token, pattern;

try {
	require(token = ':path:');
} catch (e) {
	pattern = e.message;
}

module.exports = exports = function (e, path) {
	return e.message === pattern.replace(token, path);
};

Object.defineProperties(exports, {
	token: { get: constant(token) },
	pattern: { get: constant(pattern) }
});
