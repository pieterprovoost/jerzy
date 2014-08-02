'use strict';

var resolve       = require('path').resolve
  , createContext = require('vm').createContext

  , pg = resolve(__dirname, '../__playground/module/require-in-context');

module.exports = function (t, a) {
	var context = createContext({ test: {} });
	a(t(pg + '/context.js', context)(), context.test);
};
