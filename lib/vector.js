/*
 * Vector
 */

Vector = function(elements) {
	this.elements = elements;
};

Vector.prototype.push = function(value) {
	this.elements.push(value);
};

Vector.prototype.length = function() {
	return this.elements.length;
};

Vector.prototype.sum = function() {
	var sum = 0;
	for (var i = 0, n = this.elements.length; i < n; ++i) {
		sum += this.elements[i];
	}
	return sum;
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

Vector.prototype.variance = function() {
	var m = this.mean();
	var sum = 0;
	for (var i = 0, n = this.elements.length; i < n; ++i) {
		sum += Math.pow(this.elements[i] - m, 2);
	}
	return sum / (this.elements.length - 1);
};

Vector.prototype.sd = function() {
	return Math.sqrt(this.variance());
};

/*
 * Sequence
 */

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