'use strict';

var ast    = require('./lib/ast')
  , direct = require('./lib/direct');

module.exports = function (code, options) {
	var deps;
	if (code == null) {
		throw new TypeError('Expected code string');
	}
	options = Object(options);
	try {
		deps = direct(code);
	} catch (e) {
		if (options.log) {
			console.log(e.message);
			console.log(".. trying full AST scan");
		}
		deps = ast(code);
	}
	return options.raw ? deps : deps.map(function (dep) {
		return dep.value;
	}).filter(Boolean);
};
