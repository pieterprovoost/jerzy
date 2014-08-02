// Require first named module in tree (traversing up)

'use strict';

var path          = require('path')
  , requireSilent = require('./require-silent')(require)
  , errorMsg      = require('./is-module-not-found-error')

  , dirname = path.dirname, join = path.join, sep = path.sep;

module.exports = function (name, path, root) {
	var m;
	path = join(path);
	root = root ? join(root) : sep;
	while (true) {
		m = requireSilent(path + sep + name);
		if (m) {
			if (m instanceof Error) throw m;
			return m;
		}
		if (path === root) {
			throw new Error(errorMsg.pattern.replace(errorMsg.token, name));
		}
		path = dirname(path);
	}
};
