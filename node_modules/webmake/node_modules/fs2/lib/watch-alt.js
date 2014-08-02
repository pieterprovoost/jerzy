'use strict';

var promisify   = require('deferred').promisify
  , ee          = require('event-emitter')
  , fs          = require('fs')
  , typeByStats = require('../type-by-stats')

  , lstatSync = fs.lstatSync, readdir = promisify(fs.readdir)
  , watchFile = fs.watchFile, unwatchFile = fs.unwatchFile

  , other, directory, opts = { persistent: false, interval: 1500 };

other = function (path, emitter, stats) {
	var end, close, type, listener;

	end = function (err) {
		if (emitter) {
			emitter.emit('end', err);
			close();
		}
	};

	close = function () {
		unwatchFile(path, listener);
		emitter = null;
	};

	emitter.end = end;
	emitter.close = close;
	type = typeByStats(stats);
	watchFile(path, opts, listener = function (nstats) {
		var nType, err;
		if (!emitter) return;
		if (!nstats.ctime.getTime() && !nstats.mode) {
			// It means that file doesn't exist enymore
			err = new Error("File doesn't exist");
			err.code = 'ENOENT';
			end(err);
			return;
		}
		nType = typeByStats(nstats);
		if (type !== nType) {
			err = new Error("File type have changed");
			err.code = 'DIFFTYPE';
			end(err);
			return;
		}
		if ((stats.ctime.valueOf() !== nstats.ctime.valueOf()) ||
				((stats.mtime.valueOf() !== nstats.mtime.valueOf()) ||
				(stats.size !== nstats.size))) {
			emitter.emit('change');
		}
		stats = nstats;
	});
};

directory = function (path, emitter) {
	var end, close, data, compare, listener;

	end = function (err) {
		if (emitter) {
			emitter.emit('end', err);
			close();
		}
	};

	close = function () {
		if (emitter) {
			if (listener) unwatchFile(path, listener);
			emitter = null;
		}
	};

	compare = function (file, index) { return data[index] === file; };

	emitter.end = end;
	emitter.close = close;
	readdir(path).done(function (files) {
		data = files.sort();
		watchFile(path, opts, listener = function (stats) {
			var err;
			if (!emitter) return;
			if (!stats.ctime.getTime() && !stats.mode) {
				// It means that dir doesn't exist enymore
				err = new Error("Directory doesn't exist");
				err.code = 'ENOENT';
				end(err);
				return;
			}
			readdir(path).done(function (files) {
				if (!emitter) return;
				if ((files.length !== data.length) || !files.sort().every(compare)) {
					data = files;
					emitter.emit('change');
				}
			}, end);
		});
	}, end);
};

module.exports = function (path, emitter) {
	var stats = lstatSync(path);
	if (!emitter) emitter = ee();
	if (stats.isDirectory()) directory(path, emitter);
	else other(path, emitter, stats);
	return emitter;
};
