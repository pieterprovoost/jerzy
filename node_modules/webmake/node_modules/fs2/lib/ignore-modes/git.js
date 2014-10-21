'use strict';

var deferred  = require('deferred')
  , resolve   = require('path').resolve
  , lstat     = require('fs').lstat
  , WatchPath = require('../../watch-path').WatchPath

  , isRoot;

exports.filename = '.gitignore';
exports.globalRules = ['.git'];
exports.isRoot = isRoot = function (path) {
	var def, gPath;

	gPath = resolve(path, '.git');
	def = deferred();
	lstat(gPath, function (err, stats) {
		def.resolve(err ? false : stats.isDirectory());
	});
	def.promise.gitPath = gPath;
	def.promise.path = path;
	return def.promise;
};
exports.isRoot.returnsPromise = true;

exports.isRootWatcher = function (path) {
	var promise, watcher;
	promise = isRoot(path);
	watcher = new WatchPath(promise.gitPath);
	watcher.on('change', function (event) {
		if (event.type === 'create') {
			promise.value = true;
		} else if (event.type === 'remove') {
			promise.value = false;
		} else {
			return;
		}
		promise.emit('change', promise.value, path);
	});
	promise.close = watcher.close;
	return promise;
};
exports.isRootWatcher.returnsPromise = true;
