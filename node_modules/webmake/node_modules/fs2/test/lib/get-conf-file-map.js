'use strict';

var fs        = require('fs')
  , resolve   = require('path').resolve
  , omap      = require('es5-ext/object/map')
  , deferred  = require('deferred')
  , delay     = deferred.delay
  , promisify = deferred.promisify
  , mkdir     = promisify(fs.mkdir)
  , writeFile = promisify(fs.writeFile)
  , unlink    = promisify(fs.unlink)
  , rmdir     = promisify(fs.rmdir)
  , mode      = require('../../lib/ignore-modes/git')

  , pgPath = resolve(__dirname, '../__playground/lib/get-conf-file-map');

module.exports = function (t, a, d) {
	var data, invoked = false
	  , DELAY = 100
	  , gitRoot = resolve(pgPath, '.git')
	  , rootFile = resolve(pgPath, '.gitignore')
	  , onePath = resolve(pgPath, 'one')
	  , oneFile = resolve(onePath, '.gitignore')
	  , twoPath = resolve(onePath, 'two')
	  , twoFile = resolve(twoPath, '.gitignore')
	  , gitTwo  = resolve(twoPath, '.git')
	  , watcher;

	deferred(mkdir(gitRoot), mkdir(onePath)(function () {
		return mkdir(twoPath);
	}))(delay(function () {
		watcher = t(twoPath, mode, true);
		watcher.on('change', function (arg) {
			a(invoked, false, "Invoked once");
			invoked = arg;
		});
		return watcher;
	}, DELAY))(delay(function (value) {
		var map = {};
		data = value;
		a(data.root, pgPath, '#1 Root');
		a.deep(omap(data.map, String), map, '#1 Data');
		return writeFile(oneFile, 'foo\n!bar');
	}, DELAY))(delay(function () {
		var map = {};
		map[onePath] = 'foo\n!bar';
		a(invoked, data, "#2 invoked");
		invoked = false;
		a(data.root, pgPath, '#2 Root');
		a.deep(omap(data.map, String), map, '#2 Data');
		return writeFile(twoFile, '!raz\ndwa\n');
	}, DELAY))(delay(function () {
		var map = {};
		map[onePath] = 'foo\n!bar';
		map[twoPath] = '!raz\ndwa\n';
		a(invoked, data, "#3 invoked");
		invoked = false;
		a(data.root, pgPath, '#3 Root');
		a.deep(omap(data.map, String), map, '#3 Data');
		return t(twoPath, mode);
	}, DELAY))(function (data) {
		var map = {};
		map[onePath] = 'foo\n!bar';
		map[twoPath] = '!raz\ndwa\n';
		a(data.root, pgPath, '#3 Root');
		a.deep(omap(data.map, String), map, '#3 Data');
		return writeFile(rootFile, 'one\n\ntwo\n!three\n');
	})(delay(function () {
		var map = {};
		map[pgPath] = 'one\n\ntwo\n!three\n';
		map[onePath] = 'foo\n!bar';
		map[twoPath] = '!raz\ndwa\n';
		a(invoked, data, "#4 invoked");
		invoked = false;
		a(data.root, pgPath, '#4 Root');
		a.deep(omap(data.map, String), map, '#4 Data');
		return mkdir(gitTwo);
	}, DELAY))(delay(function () {
		var map = {};
		map[twoPath] = '!raz\ndwa\n';
		a(invoked, data, "#5 invoked");
		invoked = false;
		a(data.root, twoPath, '#5 Root');
		a.deep(omap(data.map, String), map, '#5 Data');
		return rmdir(gitTwo);
	}, DELAY))(delay(function () {
		var map = {};
		map[pgPath] = 'one\n\ntwo\n!three\n';
		map[onePath] = 'foo\n!bar';
		map[twoPath] = '!raz\ndwa\n';
		a(invoked, data, "#6 invoked");
		invoked = false;
		a(data.root, pgPath, '#6 Root');
		a.deep(omap(data.map, String), map, '#6 Data');
		return unlink(twoFile);
	}, DELAY))(delay(function () {
		var map = {};
		map[pgPath] = 'one\n\ntwo\n!three\n';
		map[onePath] = 'foo\n!bar';
		a(invoked, data, "#7 invoked");
		invoked = false;
		a(data.root, pgPath, '#7 Root');
		a.deep(omap(data.map, String), map, '#7 Data');
		return unlink(oneFile);
	}, DELAY))(delay(function () {
		var map = {};
		map[pgPath] = 'one\n\ntwo\n!three\n';
		a(invoked, data, "#8 invoked");
		invoked = false;
		a(data.root, pgPath, '#8 Root');
		a.deep(omap(data.map, String), map, '#8 Data');
		return unlink(rootFile);
	}, DELAY))(delay(function () {
		var map = {};
		a(invoked, data, "#9 invoked");
		invoked = false;
		a(data.root, pgPath, '#9 Root');
		a.deep(omap(data.map, String), map, '#9 Data');
		watcher.close();
		return deferred(rmdir(gitRoot), rmdir(twoPath)(function () {
			return rmdir(onePath);
		}))(false);
	}, DELAY)).done(d, d);
};
