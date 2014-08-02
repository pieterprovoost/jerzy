'use strict';

var lstat = require('fs').lstat;

module.exports = function (t, a, d) {
	lstat(__filename, function (err, stat) {
		if (err) {
			d(err);
			return;
		}
		a(t(stat), 'file', "File");
		lstat(__dirname, function (err, stat) {
			if (err) {
				d(err);
				return;
			}
			a(t(stat), 'directory', "Directory");
			d();
		});
	});
};
