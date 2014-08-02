'use strict';

var fs        = require('fs')
  , deferred  = require('deferred')
  , resolve   = require('path').resolve
  , promisify = deferred.promisify
  , delay     = deferred.delay
  , mkdir     = promisify(fs.mkdir)
  , rmdir     = promisify(fs.rmdir)
  , gitMode   = require('../../lib/ignore-modes/git')

  , rootPath = resolve(__dirname, '../__playground/lib/find-root');

module.exports = function (t, a, d) {
	var gitRoot = resolve(rootPath, '.git')
	  , onePath = resolve(rootPath, 'one')
	  , gitOnePath = resolve(onePath, '.git')
	  , twoPath = resolve(onePath, 'two')
	  , gitTwoPath = resolve(twoPath, '.git')
	  , filePath = resolve(twoPath, 'file.xxx')
	  , DELAY = 100

	  , watcher, events = [];

	// Create /.git
	mkdir(gitRoot)(function () {

		// Create /one
		return mkdir(onePath);
	})(function () {

		// Create /one/.git
		return mkdir(gitOnePath);
	})(function () {
		watcher = t(gitMode.isRootWatcher, filePath, { watch: true });
		watcher.on('change', function (path) {
			events.push(path);
		});
		return watcher;
	})(function (path) {
		a(path, onePath, "#1");
	})(delay(function () {
		a(String(events), '', "#1: Event");
		events = [];

		// Create /one/two
		return mkdir(twoPath);
	}, DELAY))(delay(function () {

		// Create /one/two/.git
		return mkdir(gitTwoPath);
	}, DELAY))(delay(function () {
		a(String(events), twoPath, "#2: Event");
		events = [];
		return t(gitMode.isRoot, filePath);
	}, DELAY))(function (path) {
		a(path, twoPath, "#2");

		// Remove /one/.git
		return rmdir(gitOnePath);
	})(delay(function () {

		// Remove /one/two/.git
		return rmdir(gitTwoPath);
	}, DELAY))(delay(function () {
		a(String(events), rootPath, "#3: Event");
		events = [];
		return t(gitMode.isRoot, filePath);
	}, DELAY))(function (path) {
		a(path, rootPath, "#3");

		// Create /one/two/.git
		return mkdir(gitTwoPath);
	})(delay(function () {
		a(String(events), twoPath, "#4: Event");
		events = [];
		return t(gitMode.isRoot, filePath);
	}, DELAY))(function (path) {
		a(path, twoPath, "#4");

		// Remove /one/two/.git
		return rmdir(gitTwoPath);
	})(function () {

		// Remove /one/two
		return rmdir(twoPath);
	})(function () {

		// Remove /one
		return rmdir(onePath);
	})(delay(function () {
		a(String(events), rootPath, "#5: Event");
		events = [];
		return t(gitMode.isRoot, filePath);
	}, DELAY))(function (path) {
		a(path, rootPath, "#5");

		watcher.close();
		return rmdir(gitRoot);
	}).done(d, d);
};
