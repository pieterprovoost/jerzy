var vector = require('./vector');

Nonparametric = function() {};

/*
 * Two-sample Kolmogorov-Smirnov test
 */

Nonparametric.kolmogorovSmirnov = function(x, y) {
	var all = new vector.Vector(x.elements.concat(y.elements)).sort();
	var ecdfx = x.ecdf(all);
	var ecdfy = y.ecdf(all);
	console.log(ecdfy.subtract(ecdfx));
	
}

module.exports.Nonparametric = Nonparametric;
