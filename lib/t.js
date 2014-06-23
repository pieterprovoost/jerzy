var vector = require('./vector');

StudentT = function(first, second) {
	if (second instanceof vector.Vector) {
		this._twosample(first, second);
	} else {
		this._onesample(first, second);
	}
}

// two-sample Student's t-test

StudentT.prototype._twosample = function(first, second) {
	this.first = first;
	this.second = second;
	this.se = Math.sqrt((this.first.variance() / this.first.length()) + (this.second.variance() / this.second.length()));
	this.t = (this.first.mean() - this.second.mean()) / this.se;
	this.df = this.first.length() + this.second.length() - 2;
	var tdistr = new T(this.df);
	this.p = 2 * (1 - tdistr.distr(Math.abs(this.t)));
};

// one-sample Student's t-test

StudentT.prototype._onesample = function(sample, mu) {
	this.sample = sample;
	this.mu = mu;
	this.se = Math.sqrt(this.sample.variance()) / Math.sqrt(this.sample.length());
	this.t = (this.sample.mean() - this.mu) / this.se;
	this.df = this.sample.length() - 1;
	var tdistr = new T(this.df);
	this.p = 2 * (1 - tdistr.distr(Math.abs(this.t)));
};

module.exports.StudentT = StudentT;