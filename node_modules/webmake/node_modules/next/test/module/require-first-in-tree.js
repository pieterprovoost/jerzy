'use strict';

var resolve         = require('path').resolve
  , isNotFoundError = require('../../module/is-module-not-found-error')

  , pg = resolve(__dirname, '../__playground/module/require-first-in-tree');

module.exports = function (t, a) {
	var path = pg + '/first/dir'
	  , m = require(path + '/module');

	a(t('module', pg + '/first/dir'), m, "First in tree");

	m = require(pg + '/mid/dir/module');
	a(t('module', pg + '/mid/dir/dir2/dir3'), m, "Somewhere in a middle");

	m = require(pg + '/top/module');
	a(t('module', pg + '/top/one/two', pg + '/top'), m, "Last in tree");

	try {
		t('module', path = pg + '/beyond/one/dir/dir2', pg + '/beyond/one');
		a.never();
	} catch (e) {
		a(isNotFoundError(e, 'module'), true, "Beyond");
	}
};
