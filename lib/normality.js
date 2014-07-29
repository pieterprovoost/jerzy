var matrix = require('./matrix');
var vector = require('./vector');
var distributions = require('./distributions');

Normality = function() {};

Normality.shapiroWilk = function(x) {
	result = {};
	var xx = x.sort();
	var mean = x.mean();
	var n = x.length();
	var u = 1 / Math.sqrt(n);

	// m

	var sn = new distributions.StandardNormal();
	var m = new vector.Vector([]);
	for (var i = 1; i <= n; i++) {
		m.push(sn.inverse((i - 3/8) / (n + 1/4)));
	}

	// c

	var md = m.dot(m);
	var c = m.multiply(1 / Math.sqrt(md));

	// a

	var an = -2.706056 * Math.pow(u, 5) + 4.434685 * Math.pow(u, 4) - 2.071190 * Math.pow(u, 3) - 0.147981 * Math.pow(u, 2) + 0.221157 * u + c.elements[n - 1];
	var ann = -3.582633 * Math.pow(u, 5) + 5.682633 * Math.pow(u, 4) - 1.752461 * Math.pow(u, 3) - 0.293762 * Math.pow(u, 2) + 0.042981 * u + c.elements[n - 2];

	var phi;

	if (n > 5) {
		phi = (md - 2 * Math.pow(m.elements[n - 1], 2) - 2 * Math.pow(m.elements[n - 2], 2)) / (1 - 2 * Math.pow(an, 2) - 2 * Math.pow(ann, 2));
	} else {
		phi = (md - 2 * Math.pow(m.elements[n - 1], 2)) / (1 - 2 * Math.pow(an, 2));
	}

	var a = new vector.Vector([]);
	if (n > 5) {
		a.push(-an);
		a.push(-ann);
		for (var i = 2; i < n - 2; i++) {
			a.push(m.elements[i] * Math.pow(phi, -1/2));
		}		
		a.push(ann);
		a.push(an);
	} else {
		a.push(-an);
		for (var i = 1; i < n - 1; i++) {
			a.push(m.elements[i] * Math.pow(phi, -1/2));
		}		
		a.push(an);
	}

	// w

	result.w = Math.pow(a.multiply(xx).sum(), 2) / xx.ss();

	return result;
};

module.exports.Normality = Normality;