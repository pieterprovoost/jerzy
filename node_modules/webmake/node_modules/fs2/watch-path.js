'use strict';

var ee    = require('event-emitter')
  , path  = require('path')
  , watch = require('./watch').watch

  , basename = path.basename, dirname = path.dirname, join = path.join
  , resolve = path.resolve

  , Watcher;

Watcher = function (path) {
	this.path = path;
	this.missing = [];
	this.onchange = this.onchange.bind(this);
	this.onremove = this.onremove.bind(this);
	this.up = this.up.bind(this);
	this.watch();
	this.emitter = ee();
	this.emitter.close = this.close.bind(this);
	return this.emitter;
};

Watcher.prototype = {
	close: function () {
		this.watcher.close();
	},
	up: function () {
		var parent = dirname(this.path);
		if (parent === this.path) {
			return;
		}
		this.missing.unshift(basename(this.path));
		this.path = parent;
		this.watch();
	},
	watch: function () {
		var watcher;
		try {
			watcher = watch(this.path);
		} catch (e) {
			this.up();
			return;
		}
		this.onwatch(watcher);
	},
	tryDown: function () {
		var watcher, npath;
		npath = join(this.path, this.missing[0]);
		try {
			watcher = watch(npath);
		} catch (e) {
			return false;
		}
		this.path = npath;
		this.missing.shift();
		if (!this.missing.length) {
			this.onwatch(watcher);
			this.oncreate();
		} else if (!this.tryDown()) {
			this.onwatch(watcher);
		} else {
			watcher.close();
		}
		return true;
	},
	onwatch: function (watcher) {
		if (!this.missing.length) {
			watcher.on('change', this.onchange);
			watcher.once('end', this.onremove);
		} else {
			watcher.on('change', function () {
				if (this.tryDown()) {
					watcher.close();
				}
			}.bind(this));
			watcher.once('end', this.up);
		}
		this.watcher = watcher;
	},
	oncreate: function () {
		this.emitter.emit('change', { type: 'create' });
	},
	onchange: function () {
		this.emitter.emit('change', { type: 'modify' });
	},
	onremove: function () {
		this.emitter.emit('change', { type: 'remove' });
		this.up();
	}
};

module.exports = exports = function (path) {
	return new Watcher(resolve(String(path)));
};
exports.WatchPath = Watcher;
