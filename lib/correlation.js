var distributions = require('./distributions');

Correlation = function() {};

/*
 * Pearson correlation
 */

Correlation.pearson = function(x, y) {
	var result = {};
	var n = x.length();
	var mx = x.mean();
	var my = y.mean();
	result.r = x.add(-mx).multiply(y.add(-my)).sum() /
		Math.sqrt(x.add(-mx).pow(2).sum() * y.add(-my).pow(2).sum());
	result.t = result.r * Math.sqrt((n - 2) / (1 - Math.pow(result.r, 2)));
	result.df = n - 2;
	var tdistr = new distributions.T(result.df);
	result.p = 2 * (1 - tdistr.distr(Math.abs(result.t)));
	return result;
};

module.exports.Correlation = Correlation;