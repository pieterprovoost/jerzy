Numeric = function() {};

/*
 * adaptive Simpson
 */

Numeric._adaptive = function(f, a, b, eps, s, fa, fb, fc, depth) {
	var c = (a + b) / 2;
	var h = b - a;
	var d = (a + c) / 2;
	var e = (c + b) / 2;
	var fd = f(d);
	var fe = f(e);
	var left = (h / 12) * (fa + 4 * fd + fc);
	var right = (h / 12) * (fc + 4* fe + fb);
	var s2 = left + right;
	if (depth <= 0 || Math.abs(s2 - s) <= 15 * eps) {
		return s2 + (s2 - s) / 15;
	} else {
		return this._adaptive(f, a, c, eps / 2, left, fa, fc, fd, depth - 1)
			+ this._adaptive(f, c, b, eps / 2, right, fc, fb, fe, depth - 1);
	}
}

Numeric.adaptiveSimpson = function(f, a, b, eps, depth) {
	var c = (a + b) / 2;
	var h = b - a;
	var fa = f(a);
	var fb = f(b);
	var fc = f(c);
	var s = (h / 6) * (fa + 4 * fc + fb);                                                                
	return this._adaptive(f, a, b, eps, s, fa, fb, fc, depth);
}

/*
 * root finding: bisection
 */

Numeric.bisection = function(f, a, b, eps) {
	eps = typeof eps !== "undefined" ? eps : 1e-9;
	while (Math.abs(a - b) > eps) {
 		if (f(a) * f((a + b) / 2) < 0) {
 			b = (a + b) / 2;
 		} else {
 			a = (a + b) / 2;
 		}
 	}
	return (a + b) / 2;
}

/*
 * root finding: secant
 */

Numeric.secant = function(f, a, b, eps) {
	eps = typeof eps !== "undefined" ? eps : 1e-9;
	var q = [a, b];
	while (Math.abs(q[0] - q[1]) > eps) {
		q.push((q[0] * f(q[1]) - q[1] * f(q[0])) / (f(q[1]) - f(q[0])));
		q.shift();
	}
	return (q[0] + q[1]) / 2;
}

module.exports.Numeric = Numeric;