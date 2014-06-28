Correlation = function() {};

/*
 * Pearson correlation
 */

Correlation.pearson = function(x, y) {
	this.n = x.length();
	var mx = x.mean();
	var my = y.mean();

	this.r = x.add(-mx).multiply(y.add(-my)).sum() /
		Math.sqrt(x.add(-mx).pow(2).sum() * y.add(-my).pow(2).sum());
	this.t = this.r * Math.sqrt((this.n - 2) / (1 - Math.pow(this.r, 2)));
	this.df = this.n - 2;
	var tdistr = new T(this.df);
	this.p = 2 * (1 - tdistr.distr(Math.abs(this.t)));
};

module.exports.Correlation = Correlation;

