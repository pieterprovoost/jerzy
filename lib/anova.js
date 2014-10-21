var vector = require('./vector');
var distributions = require('./distributions');

Anova = function() {};

/*
 * One-way ANOVA
 */

Anova.oneway = function(x, y) {
	var result = {};

	var vectors = [];
	for (var i = 0; i < x.groups(); i++) {
		var v = new vector.Vector([]);
		var indices = x.group(i);
		for (var j = 0; j < indices.length; j++) {
			v.push(y.elements[indices[j]]);
		}
		vectors.push(v);
	}

	var mean = new vector.Vector([]);
	var n = new vector.Vector([]);
	var v = new vector.Vector([]);
	for (var i = 0; i < vectors.length; i++) {
		mean.push(vectors[i].mean());
		n.push(vectors[i].length());
		v.push(vectors[i].variance());
	}

	result.tdf = x.groups() - 1;
	result.tss = mean.add(-y.mean()).pow(2).multiply(n).sum();
	result.tms = result.tss / result.tdf;

	result.edf = x.length() - x.groups();
	result.ess = v.multiply(n.add(-1)).sum();
	result.ems = result.ess / result.edf;

	result.f = result.tms / result.ems;

	var fdistr = new distributions.F(result.tdf, result.edf);
	result.p = 1 - fdistr.distr(Math.abs(result.f));

	return result;
}

module.exports.Anova = Anova;