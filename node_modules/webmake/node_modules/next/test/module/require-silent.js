'use strict';

var resolve    = require('path').resolve
  , playground = resolve(__dirname, '../__playground/module/require-silent');

module.exports = function (t, a) {
	var file = playground + '/sample';
	a(t(require)(file), require(file), "Existing");

	file = playground + '/sample-na';
	a(t(require)(file), undefined, "Non existing");

	file = playground + '/sample-error';
	a.ok(t(require)(file) instanceof Error, "Evaluation error");

	file = playground + '/require-error';
	a.ok(t(require)(file) instanceof Error, "Internal require error");
};
