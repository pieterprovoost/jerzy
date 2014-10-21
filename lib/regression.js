var distributions = require('./distributions');

Regression = function() {};

/*
 * simple linear regression
 */

Regression.linear = function(x, y) {
	var result = {};
	result.n = x.length();

	// means

	var mx = x.mean();
	var my = y.mean();

	// parameters

	var rx = x.add(-mx);
	var ry = y.add(-my);

	var ssxx = rx.pow(2).sum();
	var ssyy = ry.pow(2).sum();
	var ssxy = rx.multiply(ry).sum();

	result.slope = ssxy / ssxx;
	result.intercept = my - result.slope * mx;

	// sum of squared residuals

	var ssr = y.add(x.multiply(result.slope).add(result.intercept).multiply(-1)).pow(2).sum();

	// residual standard error

	result.rse = Math.sqrt(ssr / (result.n - 2))
	
	// slope

	var tdistr = new distributions.T(result.n - 2);

	result.slope_se = result.rse / Math.sqrt(ssxx);
	result.slope_t = result.slope / result.slope_se;
	result.slope_p = 2 * (1 - tdistr.distr(Math.abs(result.slope_t)));

	// intercept

	result.intercept_se = result.rse / Math.sqrt(ssxx) / Math.sqrt(result.n) * Math.sqrt(x.pow(2).sum());
	result.intercept_t = result.intercept / result.intercept_se;
	result.intercept_p = 2 * (1 - tdistr.distr(Math.abs(result.intercept_t)));

	// R-squared
	
	result.rs = Math.pow(ssxy, 2) / (ssxx * ssyy);

	return result;
};

module.exports.Regression = Regression;