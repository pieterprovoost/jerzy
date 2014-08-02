'use strict';

var path      = require('path')
  , normalize = path.normalize
  , resolve   = path.resolve

  , pgPath;

pgPath = resolve(__dirname, '../__playground/module/find-package-root');

module.exports = {
	"Detect by package.json": function (t, a, d) {
		t(pgPath + '/package/one/two/', function (err, path) {
			a.equal(normalize(path), normalize(pgPath + '/package'));
			d();
		});
	},
	"Detect by node_modules": function (t, a, d) {
		t(pgPath + '/package2/one/two/samplefile', function (err, path) {
			a.equal(normalize(path), normalize(pgPath + '/package2'));
			d();
		});
	},
	"Detect by parent node_modules": function (t, a, d) {
		t(pgPath + '/package2/node_modules/package/module.js',
			function (err, path) {
				a.equal(normalize(path),
					normalize(pgPath + '/package2/node_modules/package'));
				d();
			});
	},
	"No package path": function (t, a, d) {
		t('/', function (err, path) {
			a.equal(path, null);
			d();
		});
	},
	"Wrong path": function (t, a, d) {
		t(pgPath + '/package/abc/cdf', function (err, path) {
			a.equal(normalize(path), normalize(pgPath + '/package'));
			d();
		});
	}
};
