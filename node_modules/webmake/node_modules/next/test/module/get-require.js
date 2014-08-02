'use strict';

var resolve = require('path').resolve
  , pg = resolve(__dirname, '../__playground/module/get-require');

module.exports = {
	"File path": function (t, a) {
		var path = pg + '/package/sample.js';
		a(t(path)('./sample'), require(path));
	},
	"Dir path": function (t, a) {
		a(t(pg)('./sample'), require(pg + '/sample'));
	},
	"Resolve": function (t, a) {
		a(t(pg).resolve('./sample'), resolve(pg, 'sample.js'));
	}
};
