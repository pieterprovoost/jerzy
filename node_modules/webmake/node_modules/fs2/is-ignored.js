'use strict';

var invoke         = require('es5-ext/function/invoke')
  , noop           = require('es5-ext/function/noop')
  , isCallable     = require('es5-ext/object/is-callable')
  , forEach        = require('es5-ext/object/for-each')
  , contains       = require('es5-ext/string/#/contains')
  , last           = require('es5-ext/string/#/last')
  , memoize        = require('memoizee')
  , deferred       = require('deferred')
  , minimatch      = require('minimatch')
  , path           = require('path')
  , modes          = require('./lib/ignore-modes')
  , getMap         = require('./lib/get-conf-file-map')
  , memoizeWatcher = require('./lib/memoize-watcher')
  , findRoot       = require('./lib/find-root')

  , isArray = Array.isArray, push = Array.prototype.push
  , call = Function.prototype.call, trim = call.bind(String.prototype.trim)
  , dirname = path.dirname, resolve = path.resolve, sep = path.sep
  , ConfMap = getMap.ConfMap

  , applyRules, applyGlobalRules, compile
  , IsIgnored, isIgnored, buildMap, prepareRules, parseSrc
  , eolRe = /(?:\r\n|[\n\r\u2028\u2029])/
  , sepRe = /[\\\/]/
  , minimatchOpts = { matchBase: true };

prepareRules = function (data) {
	return data.map(trim).filter(Boolean).reverse();
};

parseSrc = function (src) { return prepareRules(String(src).split(eolRe)); };

compile = function (maps, result) {
	var data = result.data = {}, paths = result.paths = [];

	// Merge rules found in ignorefiles
	maps.forEach(function (map) {
		forEach(map.map, function (rules, path) {
			if (!rules.length) return;
			if (!data[path]) {
				paths.push(path);
				data[path] = [];
			}
			data[path].push(rules);
		});
	});
	result.paths.sort();
	return result;
};

applyRules = function (rules, root, path) {
	var value, current, relPath, paths, iterate, preValue;

	current = root;
	paths = path.slice(root.length +
		((last.call(root) === sep) ? 0 : 1)).split(sep);
	iterate = function (rule) {
		preValue = true;
		if (rule[0] === '!') {
			preValue = false;
			rule = rule.slice(1);
		}
		if (rule.search(sepRe) > 0) {
			do {
				relPath = relPath.slice(relPath.indexOf(sep) + 1);
				if (minimatch(relPath, rule, minimatchOpts)) {
					value = preValue;
					return true;
				}
			} while (contains.call(relPath, sep));
		} else if (minimatch(relPath, rule, minimatchOpts)) {
			value = preValue;
			return true;
		}
	};
	while (paths.length) {
		current = current + sep + paths.shift();
		relPath = current.slice(root.length);
		value = null;
		rules.some(iterate);
		if (value === true) return { value: true, target: current };
	}
	return { value: value, target: path };
};

applyGlobalRules = function (path, rules) {
	var value;

	// Check global rules
	value = applyRules(rules, path.slice(0, path.indexOf(sep) + 1), path);
	return Boolean(value.value);
};

buildMap = function (dirname, getMap, watch) {
	var promise, data = {}, maps;
	getMap = getMap.map(function (getMap, index) {
		var map = getMap(dirname);
		if (watch) {
			map.on('change', function (map) {
				if (maps) {
					maps[index] = map;
					compile(maps, data);
					promise.emit('change', data);
				}
			});
		}
		return map;
	});
	if (getMap.length > 1) {
		promise = deferred.map(getMap)(function (result) {
			maps = result;
			return compile(maps, data);
		});
	} else {
		promise = getMap[0](function (map) {
			maps = [map];
			return compile(maps, data);
		});
	}
	if (watch) {
		promise.close = function () { getMap.forEach(invoke('close')); };
	}
	return promise;
};

IsIgnored = function (path, watch) {
	this.path = path;
	this.dirname = dirname(path);
	this.watch = watch;
};

IsIgnored.prototype = {
	init: function (mapPromise) {
		this.mapPromise = mapPromise;
		this.promise = mapPromise(function (data) {
			this.data = data;
			return this.calculate();
		}.bind(this));
		if (this.watch) {
			mapPromise.on('change', function () {
				var value = this.calculate();
				if (value !== this.promise.value) {
					this.promise.value = value;
					this.promise.emit('change', value, this.path);
				}
			}.bind(this));
			this.promise.close = this.close.bind(this);
		}
		return this.promise;
	},
	close: function () { this.mapPromise.close(); },
	calculate: function () {
		var current, result = false;

		if (!this.data.paths) return false;

		// Apply rules
		current = this.path;
		this.data.paths.some(function (rulesPath) {
			if (rulesPath.length > this.dirname.length) return true;
			this.data.data[rulesPath].forEach(function (rules) {
				var data = applyRules(rules, rulesPath, current);
				if ((data.value === false) && (current !== path)) {
					data = applyRules(rules, rulesPath, this.path);
				}
				if ((data.target !== current) || (data.value != null)) {
					result = data.value;
				}
				current = data.target;
			}, this);
		}, this);
		return Boolean(result);
	}
};

isIgnored = function (mode, path, options) {
	var watch, globalRules, isIgnored, getMapFns, dirname, promise;

	if (options.globalRules != null) {
		globalRules = isArray(options.globalRules) ? options.globalRules :
				String(options.globalRules).split(eolRe);
	}

	if (mode) {
		getMapFns = [];
		if (!globalRules) globalRules = [];
		if (!isArray(mode)) {
			if (!modes[mode]) throw new Error("Unknown mode '" + mode + "'");
			mode = [mode];
		}
		mode.forEach(function (name) {
			var mode = modes[name];
			if (!mode) throw new Error("Unknown mode '" + name + "'");
			getMapFns.push(function (path) {
				return getMap(dirname, mode, watch, parseSrc);
			});
			if (mode.globalRules) push.apply(globalRules, mode.globalRules);
		});
	}
	watch = options.watch;

	if (globalRules) {
		globalRules = prepareRules(globalRules);
		if (applyGlobalRules(path, globalRules)) {
			promise = deferred(true);
			if (watch) promise.close = noop;
			return promise;
		}
	}

	if (!mode) {
		promise = deferred(false);
		if (watch) promise.close = noop;
		return promise;
	}

	isIgnored = new IsIgnored(path, watch);
	dirname = isIgnored.dirname;
	return isIgnored.init(buildMap(dirname, getMapFns, watch));
};
isIgnored.returnsPromise = true;

module.exports = exports = function (mode, path) {
	var options, cb;
	path = resolve(String(path));

	options = Object(arguments[2]);
	cb = arguments[3];
	if (!cb) {
		if (isCallable(options)) {
			cb = options;
			options = {};
		}
	}
	return isIgnored(mode, path, options).cb(cb);
};

exports.returnsPromise = true;
exports.isIgnored = isIgnored;
exports.IsIgnored = IsIgnored;
exports.applyGlobalRules = applyGlobalRules;

exports.getIsIgnored = function (modeNames, globalRules, watch) {
	var memo, mapGetters = [], build;
	if (!globalRules) globalRules = [];
	memo = watch ? memoizeWatcher : memoize;
	modeNames.forEach(function (name) {
		var mode = modes[name], isRoot, readRules;
		if (!mode) throw new Error("Unknown mode '" + name + "'");
		isRoot = memo(mode[watch ? 'isRootWatcher' : 'isRoot'],
			{ primitive: true });
		readRules = memo(getMap[watch ? 'readRulesWatcher' : 'readRules'],
			{ primitive: true });
		mapGetters.push(function (path) {
			var map;
			map = new ConfMap(path, watch);
			map.filename = mode.filename;
			map.readRules = readRules;
			map.parse = parseSrc;
			return map.init(findRoot(isRoot, path, { watch: watch }));
		});
		if (mode.globalRules) push.apply(globalRules, mode.globalRules);
	});
	build = memo(function (dirname) {
		return buildMap(dirname, mapGetters, watch);
	}, { primitive: true });

	return {
		isIgnored: function (path) {
			var isIgnored;
			isIgnored = new IsIgnored(path, watch);
			return isIgnored.init(build(isIgnored.dirname));
		},
		globalRules: globalRules.length ? prepareRules(globalRules) : null
	};
};
