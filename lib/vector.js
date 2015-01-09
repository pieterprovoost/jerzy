Vector = function(elements) {
	this.elements = elements;
};

Vector.prototype.push = function(value) {
	this.elements.push(value);
};

Vector.prototype.map = function(fun) {
	return new Vector(this.elements.map(fun));
};

Vector.prototype.length = function() {
	return this.elements.length;
};

Vector.prototype.concat = function(x) {
	return new Vector(this.elements.slice(0).concat(x.elements.slice(0)));
};

Vector.prototype.abs = function() {
	var values = [];
	for (var i = 0; i < this.elements.length; i++) {
		values.push(Math.abs(this.elements[i]));
	}
	return new Vector(values);
};

Vector.prototype.dot = function(v) {
	var result = 0;
	for (var i = 0; i < this.length(); i++) {
		result = result + this.elements[i] * v.elements[i];
	}
	return result;
};

Vector.prototype.sum = function() {
	var sum = 0;
	for (var i = 0, n = this.elements.length; i < n; ++i) {
		sum += this.elements[i];
	}
	return sum;
};

Vector.prototype.log = function() {
	var result = new Vector(this.elements.slice(0));
	for (var i = 0, n = this.elements.length; i < n; ++i) {
		result.elements[i] = Math.log(result.elements[i]);
	}
	return result;
};

Vector.prototype.add = function(term) {
	var result = new Vector(this.elements.slice(0));
	if (term instanceof Vector) {
		for (var i = 0, n = result.elements.length; i < n; ++i) {
			result.elements[i] += term.elements[i];
		}
	} else {
		for (var i = 0, n = result.elements.length; i < n; ++i) {
			result.elements[i] += term;
		}
	}
	return result;
};

Vector.prototype.subtract = function(term) {
	return this.add(term.multiply(-1));
};

Vector.prototype.multiply = function(factor) {
	var result = new Vector(this.elements.slice(0));
	if (factor instanceof Vector) {
		for (var i = 0, n = result.elements.length; i < n; ++i) {
			result.elements[i] = result.elements[i] * factor.elements[i];
		}
	} else {
		for (var i = 0, n = result.elements.length; i < n; ++i) {
			result.elements[i] = result.elements[i] * factor;
		}
	}
	return result;
};

Vector.prototype.pow = function(p) {
	var result = new Vector(this.elements.slice(0));
	if (p instanceof Vector) {
		for (var i = 0, n = result.elements.length; i < n; ++i) {
			result.elements[i] = Math.pow(result.elements[i], p.elements[i]);
		}
	} else {
		for (var i = 0, n = result.elements.length; i < n; ++i) {
			result.elements[i] = Math.pow(result.elements[i], p);
		}
	}
	return result;
};

Vector.prototype.mean = function() {
	var sum = 0;
	for (var i = 0, n = this.elements.length; i < n; ++i) {
		sum += this.elements[i];
	}
	return sum / this.elements.length;
};

Vector.prototype.geomean = function() {
	return Math.exp(this.log().sum() / this.elements.length);
};

Vector.prototype.sortElements = function() {
	var sorted = this.elements.slice(0);
	for (var i = 0, j, tmp; i < sorted.length; ++i) {
		tmp = sorted[i];
		for (j = i - 1; j >= 0 && sorted[j] > tmp; --j) {
			sorted[j + 1] = sorted[j];
		}
		sorted[j + 1] = tmp;
	}
	return sorted;
};

Vector.prototype._ecdf = function(x) {
	var sorted = this.sortElements();
	var count = 0;
	for (var i = 0; i < sorted.length && sorted[i] <= x; i++) {
		count++;	
	}
	return count / sorted.length;
};

Vector.prototype.ecdf = function(arg) {
	if (arg instanceof Vector) {
		var result = new Vector([]);
		for (var i = 0; i < arg.length(); i++) {
			result.push(this._ecdf(arg.elements[i]));
		}
		return result;
	} else {
		return this._ecdf(arg);
	}
};

Vector.prototype.sort = function() {
	return new Vector(this.sortElements());
};

Vector.prototype.min = function() {
	return this.sortElements()[0];
};

Vector.prototype.max = function() {
	return this.sortElements().pop();
};

Vector.prototype.toString = function() {
	return "[" + this.elements.join(", ") + "]";
};

/*
 * unbiased sample variance
 */

Vector.prototype.variance = function() {
	return this.ss() / (this.elements.length - 1);
};

/*
 * biased sample variance
 */

Vector.prototype.biasedVariance = function() {
	return this.ss() / this.elements.length;
};

/*
 * corrected sample standard deviation
 */

Vector.prototype.sd = function() {
	return Math.sqrt(this.variance());
};

/*
 * uncorrected sample standard deviation
 */

Vector.prototype.uncorrectedSd = function() {
	return Math.sqrt(this.biasedVariance());
};

/*
 * standard error of the mean
 */

 Vector.prototype.sem = function() {
 	return this.sd() / Math.sqrt(this.elements.length);
 };

/*
 * total sum of squares
 */

Vector.prototype.ss = function() {
	var m = this.mean();
	var sum = 0;
	for (var i = 0, n = this.elements.length; i < n; ++i) {
		sum += Math.pow(this.elements[i] - m, 2);
	}
	return sum;
};

/*
 * residuals
 */

Vector.prototype.res = function() {
	return this.add(-this.mean());
};

Vector.prototype.kurtosis = function() {
	return this.res().pow(4).mean() / Math.pow(this.res().pow(2).mean(), 2);
};

Vector.prototype.skewness = function() {
	return this.res().pow(3).mean() / Math.pow(this.res().pow(2).mean(), 3 / 2);
};

Sequence.prototype = new Vector();

Sequence.prototype.constructor = Sequence;

function Sequence(min, max, step) {
	this.elements = [];
	for (var i = min; i <= max; i = i + step) {
		this.elements.push(i);
	}
};

module.exports.Vector = Vector;
module.exports.Sequence = Sequence;
