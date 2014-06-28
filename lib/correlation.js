Correlation = function() {};

/*
 * Pearson correlation
 */

Correlation.pearson = function(x, y) {
	var mx = x.mean();
	var my = y.mean();

	return x.add(-mx).multiply(y.add(-my)).sum() /
		Math.sqrt(x.add(-mx).pow(2).sum() * y.add(-my).pow(2).sum());
};

module.exports.Correlation = Correlation;