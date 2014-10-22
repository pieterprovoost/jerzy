'use strict';

module.exports = function (t, a) {
	var fn, invoked, mfn, x, y, z;
	fn = function (path) {
		return { emit: function () {}, close: function () { invoked = true; } };
	};
	invoked = false;

	mfn = t(fn);
	x = mfn('foo');
	y = mfn('foo');
	z = mfn('bar');
	a(invoked, false, "Pre calls");

	z.close();
	a(invoked, true, "After single call");
	invoked = false;

	z.close();
	a(invoked, false, "Second close call has no effect");
	invoked = false;

	x.close();
	a(invoked, false, "After one of two calls");
	invoked = false;
	y.close();
	a(invoked, true, "After two of two calls");
	invoked = false;
	x.close();
	a(invoked, false, "Second close call has no effect (two calls case)");
	invoked = false;
};
