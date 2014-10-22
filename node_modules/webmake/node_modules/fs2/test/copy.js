'use strict';

var path = require('path')
  , fs   = require('fs')
  , pg   = path.resolve(__dirname, './__playground/copy');

module.exports = {
	"Success": function (t, a, d) {
		var src = pg + '/sample.js'
		  , dst = pg + '/sample.copy.js';
		t(src, dst, function (err) {
			if (err) {
				d(err);
				return;
			}
			fs.readFile(src, 'utf8', function (err, srcContent) {
				if (err) {
					d(err);
					return;
				}
				fs.readFile(dst, 'utf8', function (err, dstContent) {
					if (err) {
						d(err);
						return;
					}
					a(dstContent, srcContent, "Content");

					fs.stat(src, function (err, srcStats) {
						if (err) {
							d(err);
							return;
						}
						fs.stat(dst, function (err, dstStats) {
							if (err) {
								d(err);
								return;
							}
							a(srcStats.mode, dstStats.mode);
							fs.unlink(dst, d);
						});
					});
				});
			});
		});
	},
	"Wrong path": function (t, a, d) {
		t(pg + '/sample.js', pg + '/:;\\//wrong-filename').done(a.never,
			function (e) { a(e.code, 'ENOENT', "Path error"); d(); });
	}
};
