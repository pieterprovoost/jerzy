'use strict';

module.exports = function (t, a, d) {
	t(__filename)(function (stats) {
		a(stats.isFile(), true, "Success");
		return t(__filename + 'n/a')(a.never, function (err) {
			a(err.code, 'ENOENT', "Error");
		});
	}, a.never).done(d, d);
};
