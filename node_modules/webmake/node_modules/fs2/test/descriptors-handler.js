'use strict';

var fs = require('fs');

module.exports = function (t, a, d) {
	var done = 0;
	t();
	fs.closeSync(fs.openSync(__filename, 'r'));
	fs.open(__filename, 'r', function (err, fd) {
		a(typeof fd, 'number', "Open");
		fs.close(fd, function (err) {
			if (err || done++) {
				d(err);
			}
		});
	});
	fs.readdir(__dirname, function (err, result) {
		a(Array.isArray(result), true, "Readdir");
		if (done++) {
			d();
		}
	});
};
