var vector = require('./vector');

Nonparametric = function() {};

/*
 * Two-sample Kolmogorov-Smirnov test
 */

Nonparametric.kolmogorovSmirnov = function(x, y) {
	var all = new vector.Vector(x.elements.concat(y.elements)).sort();
	
	
}

module.exports.Nonparametric = Nonparametric;
