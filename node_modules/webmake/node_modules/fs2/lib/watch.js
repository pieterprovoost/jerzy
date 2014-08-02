'use strict';

var promisify   = require('deferred').promisify
  , ee          = require('event-emitter')
  , fs          = require('fs')
  , typeByStats = require('../type-by-stats')

  , nextTick = process.nextTick
  , lstat = promisify(fs.lstat), watch = fs.watch

  , opts = { persistent: false };

module.exports = function (path, emitter) {
	var stats, fileType, listener, watcher, lock
	  , end, clearLock, close;

	end = function (err) {
		if (emitter) {
			emitter.emit('end', err);
			close();
		}
	};

	close = function () {
		if (emitter) {
			watcher.close();
			emitter = null;
		}
	};

	clearLock = function () { lock = null; };

	listener = function (type) {
		if (lock) return;
		if (lock === false) {
			lock = (type === 'rename');
			return;
		}
		lock = (type === 'rename');
		// We do timeout, as there are cases that reinitializing watcher right away
		// doesn't work as file is not accessible. It gives us false positive that
		// file is removed (and that is not reported by dir watcher on parent dir)
		setTimeout(function () {
			var nwatcher;
			nextTick(clearLock);
			watcher.close();
			try {
				nwatcher = watch(path, opts, listener);
			} catch (e) {
				end(e);
				return;
			}
			watcher = nwatcher;
			watcher.on('error', end);
			if (stats && (lock || stats.isFile())) {
				lstat(path).done(function (nstats) {
					var newFileType, err;
					if (!emitter) return;
					newFileType = typeByStats(nstats);
					if (fileType !== newFileType) {
						err = new Error("File type have changed");
						err.code = 'DIFFTYPE';
						end(err);
						return;
					}
					if (stats.isDirectory() ||
							((stats.ctime.valueOf() !== nstats.ctime.valueOf()) ||
							((stats.mtime.valueOf() !== nstats.mtime.valueOf()) ||
								(stats.size !== nstats.size)))) {
						emitter.emit('change');
					}
					stats = nstats;
				}, end);
			}
		}, 10);
	};

	watcher = watch(path, opts, listener);
	watcher.on('error', end);
	if (!emitter) emitter = ee();
	emitter.end = end;
	emitter.close = close;
	lstat(path)(function (nstats) {
		stats = nstats;
		fileType = typeByStats(stats);
	}, end);
	return emitter;
};
