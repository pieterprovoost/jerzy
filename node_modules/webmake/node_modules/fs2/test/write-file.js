'use strict';

var fs      = require('fs')
  , resolve = require('path').resolve
  , rmdir   = require('../rmdir')

  , readFile = fs.readFile, unlink = fs.unlink

  , pgPath = resolve(__dirname, './__playground')
  , overwritePath = resolve(pgPath, 'write-file-test')
  , intermediateDirPath = resolve(pgPath, '_write-file')
  , intermediatePath = resolve(intermediateDirPath, 'intermediate/test');

module.exports = {
	"Overwrite": function (t, a, d) {
		t(overwritePath, 'raz', function (err) {
			a(err, null, '#1');
		});
		t(overwritePath, 'dwa', function (err) {
			a(err, null, '#2');
		});
		t(overwritePath, 'trzy', function (err) {
			a(err, null, '#3');
			readFile(overwritePath, function (err, content) {
				a(String(content), 'trzy', "Last written");
				unlink(overwritePath, d);
			});
		});
	},
	"Intermediate": function (t, a, d) {
		t(intermediatePath, 'elo', { intermediate: true }, function (err) {
			if (err) {
				d(err);
				return;
			}
			fs.readFile(intermediatePath, function (err, content) {
				if (err) {
					d(err);
					return;
				}
				a(String(content), 'elo', "Content");
				rmdir(intermediateDirPath, { recursive: true, force: true }, d);
			});
		});
	}
};
