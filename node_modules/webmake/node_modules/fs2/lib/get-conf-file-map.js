// Function that provides map of rules found in ignorefiles for given ignorefile
// type. Additinally it invokes event on changes in map which are results of
// changes in ignorefiles.

'use strict';

var invoke    = require('es5-ext/function/invoke')
  , assign    = require('es5-ext/object/assign')
  , forEach   = require('es5-ext/object/for-each')
  , isCopy    = require('es5-ext/object/is-copy-deep')
  , endsWith  = require('es5-ext/string/#/ends-with')
  , deferred  = require('deferred')
  , path      = require('path')
  , findRoot  = require('./find-root')
  , readFile  = require('../read-file').readFile

  , dirname = path.dirname, sep = path.sep
  , ConfMap, readRules, readRulesWatcher, paths, getMap, lockId = 0;

paths = function (root, path2) {
	var starter, data;
	starter = [root];
	if (root === path2) {
		return starter;
	}
	if (endsWith.call(root, sep)) {
		data = path2.slice(root.length).split(sep);
		starter.push(root += data.shift());
	} else {
		data = path2.slice(root.length + 1).split(sep);
	}
	return starter.concat(data.map(function (path) {
		return (root += sep + path);
	}));
};

readRules = function (path) {
	return this.readFile(path + sep + this.filename)(function (src) {
		return (src == null) ? src : this.parse(src, path);
	}.bind(this));
};
readRulesWatcher = function (path) {
	var watcher, promise, current;
	watcher = this.readFile(path + sep + this.filename);
	promise = watcher(function (src) {
		return (current = ((src == null) ? src : this.parse(src, path)));
	}.bind(this));
	watcher.on('change', function (data) {
		data = ((data == null) ? data : this.parse(data, path));
		if (data === current) return;
		if ((current != null) && (data != null) && (typeof current === 'object')
				&& isCopy(current, data)) {
			return;
		}
		current = promise.value = data;
		promise.emit('change', current, path);
	}.bind(this));
	promise.close = watcher.close;
	return promise;
};

ConfMap = function (path, watch) {
	this.path = path;
	this.watch = watch;
	this.data = { root: null, map: {} };
	assign(this, deferred());
	if (this.watch) {
		this.onRulesChange = this.onRulesChange.bind(this);
		this.rulePromises = {};
		this.promise.close = this.close.bind(this);
	}
};
ConfMap.prototype = {
	init: function (findRoot) {
		this.findRoot = findRoot;
		if (this.watch) {
			findRoot.on('change', this.updateRoot.bind(this));
		}
		findRoot.done(function (root) {
			if (root) {
				this.data.root = root;
				this.addPaths(root, this.path).done(function () {
					this.resolve(this.data);
				}.bind(this), this.resolve);
			} else {
				this.resolve(this.data);
			}
		}.bind(this), this.resolve);
		return this.promise;
	},
	close: function () {
		if (this.rulePromises) {
			this.findRoot.close();
			forEach(this.rulePromises, invoke('close'));
			delete this.rulePromises;
		}
	},
	parse: String,
	readFile: function (path) {
		return readFile(path, { loose: true, watch: this.watch });
	},
	onRulesChange: function (rules, path) {
		if (rules == null) {
			delete this.data.map[path];
		} else {
			this.data.map[path] = rules;
		}
		this.promise.emit('change', this.data);
	},
	addPaths: function (root, path) {
		return deferred.map(paths(root, path), function (path) {
			var rules = this.readRules(path);
			if (this.watch) {
				this.rulePromises[path] = rules;
				rules.on('change', this.onRulesChange);
			}
			return rules.aside(function (rules) {
				if (rules != null) {
					this[path] = rules;
				}
			}.bind(this.data.map))(null, function (err) {
				// Watcher might have been closed in a meantime, if it was we ignore
				// this error as we're not interested in that value anymore
				return this.rulePromises[path] ? err : null;
			}.bind(this));
		}, this);
	},
	removePaths: function (root, path) {
		paths(root, path).forEach(function (path) {
			var promise = this.rulePromises[path];
			delete this.rulePromises[path];
			delete this.data.map[path];
			promise.close();
		}, this);
	},
	updateRoot: function (root) {
		var lock = ++lockId;
		if (!root) {
			this.removePaths(this.data.root, this.path);
			this.data.root = null;
			this.promise.emit('change', this.data);
		} else if (!this.data.root) {
			this.data.root = root;
			this.addPaths(root, this.path).done(function () {
				if (lock === lockId) {
					this.promise.emit('change', this.data);
				}
			}.bind(this));
		} else if (this.data.root < root) {
			this.removePaths(this.data.root, dirname(root));
			this.data.root = root;
			this.promise.emit('change', this.data);
		} else {
			this.addPaths(root, dirname(this.data.root)).done(function () {
				if (lock === lockId) {
					this.promise.emit('change', this.data);
				}
			}.bind(this));
			this.data.root = root;
		}
	}
};

getMap = module.exports = function (path, mode, watch, parse) {
	var map = new ConfMap(path, watch);
	map.filename = mode.filename;
	map.readRules = watch ? readRulesWatcher : readRules;
	if (parse) {
		map.parse = parse;
	}
	return map.init(findRoot(watch ? mode.isRootWatcher : mode.isRoot,
		path, { watch: watch }));
};
getMap.ConfMap = ConfMap;
getMap.readRules = readRules;
getMap.readRulesWatcher = readRulesWatcher;
