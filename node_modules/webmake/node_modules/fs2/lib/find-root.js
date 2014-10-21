'use strict';

var invoke     = require('es5-ext/function/invoke')
  , assign     = require('es5-ext/object/assign')
  , forEach    = require('es5-ext/object/for-each')
  , deferred   = require('deferred')
  , dirname    = require('path').dirname

  , FindRoot;

FindRoot = function () {};
FindRoot.prototype = {
	known: false,
	close: function () {
		if (this.promises) {
			forEach(this.promises, invoke('close'));
			this.known = true;
			delete this.promises;
		}
		if (!this.promise.resolved) {
			this.reject(new Error('Find root action cancelled'));
		}
	},
	onvalue: function (value) {
		if (this.known) {
			return;
		}
		if (value) {
			this.known = true;
			if (this.watch && this.promise.resolved) {
				this.promise.value = this.path;
				this.promise.emit('change', this.path);
			} else {
				this.resolve(this.path);
			}
		} else {
			this.down();
		}
	},
	next: function () {
		var isRoot;
		isRoot = this.isRoot(this.path);
		if (this.watch) {
			this.promises[this.path] = isRoot;
			isRoot.on('change', this.onevent);
		}
		isRoot.done(this.onvalue);
	},
	down: function () {
		var dir = dirname(this.path);
		if (dir === this.path) {
			this.known = true;
			this.path = '';
			if (this.watch && this.promise.resolved) {
				this.promise.value = null;
				this.promise.emit('change', null);
			} else {
				this.resolve(null);
			}
			return;
		}
		this.path = dir;
		this.next();
	},
	onevent: function (value, path) {
		var dir;
		if (!value) {
			if (!this.known || (path !== this.path)) {
				return;
			}
			this.known = false;
			this.down();
		} else {
			if (path == null) throw new TypeError("Path must be provided");
			this.path = path;
			dir = dirname(path);
			while (this.promises[dir]) {
				this.promises[dir].close();
				delete this.promises[dir];
				dir = dirname(dir);
			}
			this.known = true;
			// Race condition may occur, double check
			if (this.promise.value !== this.path) {
				this.promise.value = this.path;
				this.promise.emit('change', this.path);
			}
		}
	}
};
module.exports = function (isRoot, path/*, options*/) {
	var findRoot, options;
	options = arguments[2];
	findRoot = new FindRoot();
	findRoot.isRoot = isRoot;
	findRoot.path = path;
	findRoot.onvalue = findRoot.onvalue.bind(findRoot);
	findRoot.onevent = findRoot.onevent.bind(findRoot);
	assign(findRoot, deferred());
	findRoot.watch = options && options.watch;
	if (findRoot.watch) {
		findRoot.promises = {};
		findRoot.promise.close = findRoot.close.bind(findRoot);
	}
	findRoot.next();
	return findRoot.promise;
};
