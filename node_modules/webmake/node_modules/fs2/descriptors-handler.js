'use strict';

var last    = require('es5-ext/array/#/last')
  , d       = require('d')
  , memoize = require('memoizee')
  , fs      = require('fs')

  , max = Math.max
  , limit = Infinity, count = 0, release;

module.exports = exports = memoize(function () {
	var open = fs.open, openSync = fs.openSync, close = fs.close
	  , closeSync = fs.closeSync, readdir = fs.readdir

	  , queue = [];

	release = function () {
		var name, args, cb;
		while ((count < limit) && (name = queue.shift())) {
			try {
				fs[name].apply(fs, args = queue.shift());
			} catch (e) {
				cb = last.call(args);
				if (typeof cb === 'function') {
					cb(e);
				}
			}
		}
	};

	fs.open = function (path, flags, mode, cb) {
		var openCount, args;
		if (count >= limit) {
			queue.push('open', arguments);
			return;
		}
		openCount = count++;
		args = arguments;
		cb = last.call(args);
		open(path, flags, mode, function (err, fd) {
			if (err) {
				--count;
				if (err.code === 'EMFILE') {
					if (limit > openCount) {
						limit = openCount;
					}
					queue.push('open', args);
					release();
					return;
				}
				release();
			}
			if (typeof cb === 'function') cb(err, fd);
		});
	};

	fs.openSync = function (path, flags, mode) {
		var result = openSync.apply(this, arguments);
		++count;
		return result;
	};

	fs.close = function (fd, cb) {
		close(fd, function (err) {
			if (!err) {
				--count;
				release();
			}
			if (typeof cb === 'function') {
				cb(err);
			}
		});
	};

	fs.closeSync = function (fd) {
		var result;
		result = closeSync(fd);
		--count;
		release();
		return result;
	};

	fs.readdir = function (path, callback) {
		var openCount, args;
		if (count >= limit) {
			queue.push('readdir', arguments);
			return;
		}
		openCount = count++;
		args = arguments;
		readdir(path, function (err, result) {
			--count;
			if (err && err.code === 'EMFILE') {
				if (limit > openCount) {
					limit = openCount;
				}
				queue.push('readdir', args);
				release();
				return;
			}
			release();
			if (typeof callback === 'function') callback(err, result);
		});
	};
});

Object.defineProperties(exports, {
	limit: d.gs(function () {
		return limit;
	}, function (nLimit) {
		if (limit >= nLimit) {
			limit = max(nLimit, 5);
		}
	}),
	available: d.gs(function () {
		return max(limit - count, 0);
	}),
	taken: d.gs(function () {
		return count;
	}),
	open: d(function () {
		++count;
	}),
	close: d(function () {
		--count;
		if (release) release();
	})
});
