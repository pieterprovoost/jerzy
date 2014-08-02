// Require module in given context

'use strict';

var validValue = require('es5-ext/object/valid-value')
  , Module     = require('module')
  , readFile   = require('fs').readFileSync
  , dirname    = require('path').dirname
  , vm         = require('vm')
  , memoize    = require('memoizee')
  , errorMsg   = require('./is-module-not-found-error')

  , natives = process.binding('natives')
  , wrap = Module.wrap, get;

get = memoize(function (path, context) {
	return new Module(path, module);
});

module.exports = exports = function (path, context) {
	var fmodule, content, dirpath;

	validValue(context);
	if (context === global) return require(path);
	if (natives.hasOwnProperty(path)) return require(path);
	fmodule = get(path, context);
	if (fmodule.loaded) return fmodule.exports;
	fmodule.filename = path;
	dirpath = dirname(path);
	fmodule.paths = Module._nodeModulePaths(dirpath);
	fmodule.require = function (path) {
		return exports(Module._resolveFilename(String(path), this), context);
	};
	try {
		content = readFile(path, 'utf8');
	} catch (e) {
		throw new Error(errorMsg.pattern.replace(errorMsg.token, path));
	}
	fmodule.loaded = true;
	vm.runInContext(wrap(content), context, path).call(fmodule.exports,
		fmodule.exports, fmodule.require.bind(fmodule), fmodule, path, dirpath);
	return fmodule.exports;
};
