var vector = require('./vector');
var distributions = require('./distributions');

StudentT = function(){};

StudentT.test = function(first, second) {
	if (second instanceof vector.Vector) {
		return this._twosample(first, second);
	} else {
		return this._onesample(first, second);
	}
};

/*
 * two-sample Student's t-test
 */

StudentT._twosample = function(first, second) {
	var result = {};
	result.se = Math.sqrt((first.variance() / first.length()) + (second.variance() / second.length()));
	result.t = (first.mean() - second.mean()) / result.se;
	result.df = first.length() + second.length() - 2;
	var tdistr = new distributions.T(result.df);
	result.p = 2 * (1 - tdistr.distr(Math.abs(result.t)));
	return result;
};

/*
 * one-sample Student's t-test
 */

StudentT._onesample = function(sample, mu) {
	var result = {};
	result.sample = sample;
	result.mu = mu;
	result.se = Math.sqrt(result.sample.variance()) / Math.sqrt(result.sample.length());
	result.t = (result.sample.mean() - result.mu) / result.se;
	result.df = result.sample.length() - 1;
	var tdistr = new distributions.T(result.df);
	result.p = 2 * (1 - tdistr.distr(Math.abs(result.t)));
	return result;
};

module.exports.StudentT = StudentT;