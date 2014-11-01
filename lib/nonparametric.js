var vector = require('./vector');
var distributions = require('./distributions');

Nonparametric = function() {};

/*
 * Two-sample Kolmogorov-Smirnov test
 */

Nonparametric.kolmogorovSmirnov = function(x, y) {
	var all = new vector.Vector(x.elements.concat(y.elements)).sort();
	var ecdfx = x.ecdf(all);
	var ecdfy = y.ecdf(all);
	var d = ecdfy.subtract(ecdfx).abs().max();

	var k = sup * Math.sqrt((x.length() + y.length()) / (x.length() * y.length()));

	console.log("d", d);
	console.log("k", k);
	
}

module.exports.Nonparametric = Nonparametric;
