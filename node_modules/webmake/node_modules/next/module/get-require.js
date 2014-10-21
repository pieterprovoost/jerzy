// Return require function for given path

'use strict';

var Module = require('module')
  , fs     = require('fs')
  , path   = require('path')

  , isArray = Array.isArray, defineProperty = Object.defineProperty
  , stat = fs.statSync, nodeCache = Module._cache
  , getDirname = path.dirname, resolve = path.resolve

  , cache = {}, getFromNodeCache;

getFromNodeCache = function (module) {
	var require;
	if (module.require) {
		// >= v0.5
		require = function (path) {
			return module.require(path);
		};
		defineProperty(require, 'paths', { get: function () {
			throw new Error('require.paths is removed. Use ' +
				'node_modules folders, or the NODE_PATH ' +
				'environment variable instead.');
		} });
	} else {
		// <= v0.4
		require = function (path) {
			return Module._load(path, module);
		};
		require.paths = Module._paths;
	}
	require.extensions = Module._extensions;
	require.registerExtension = function () {
		throw new Error('require.registerExtension() removed. Use ' +
			'require.extensions instead.');
	};
	require.main = process.mainModule;
	require.cache = nodeCache;
	require.resolve = function (request) {
		var res = Module._resolveFilename(request, module);
		return isArray(res) ? res[1] : res;
	};

	return require;
};

module.exports = function (filename) {
	var dirname, stats, id, fmodule;
	filename = resolve(filename);
	if (cache[filename]) {
		return cache[filename];
	}
	if ((fmodule = nodeCache[filename])) {
		return (cache[filename] = getFromNodeCache(fmodule));
	}

	stats = stat(filename);
	dirname = stats.isDirectory() ? filename : getDirname(filename);
	id = dirname + '/__get-require.next.js';
	fmodule = new Module(id, module);
	fmodule.filename = id;
	fmodule.paths = Module._nodeModulePaths(dirname);
	fmodule.loaded = true;
	return (cache[filename] = getFromNodeCache(fmodule));
};
