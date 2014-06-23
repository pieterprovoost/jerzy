Numeric = function() {};

// Numeric.adaptiveSimpson

Numeric.prototype._adaptive = function(f, a, b, eps, s, fa, fb, fc, depth) {
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

Numeric.prototype.adaptiveSimpson = function(f, a, b, eps, depth) {
	var c = (a + b) / 2;
	var h = b - a;
	var fa = f(a);
	var fb = f(b);
	var fc = f(c);
	var s = (h / 6) * (fa + 4 * fc + fb);                                                                
	return this._adaptive(f, a, b, eps, s, fa, fb, fc, depth);
}

Numeric = new Numeric();

module.exports.Numeric = Numeric;