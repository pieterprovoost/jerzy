LinearRegression = function(x, y) {

	this.n = x.length();
	this.x = x;
	this.y = y;

	// means

	var mx = this.x.mean();
	var my = this.y.mean();

	// parameters

	var rx = this.x.add(-mx);
	var ry = this.y.add(-my);

	var ssxx = rx.pow(2).sum();
	var ssyy = ry.pow(2).sum();
	var ssxy = rx.multiply(ry).sum();

	this.slope = ssxy / ssxx;
	this.intercept = my - this.slope * mx;

	// sum of squared residuals

	var ssr = y.add(x.multiply(this.slope).add(this.intercept).multiply(-1)).pow(2).sum();

	// residual standard error

	this.rse = Math.sqrt(ssr / (this.n - 2))
	
	// slope

	var tdistr = new T(this.n - 2);

	this.slope_se = this.rse / Math.sqrt(ssxx);
	this.slope_t = this.slope / this.slope_se;
	this.slope_p = 2 * (1 - tdistr.distr(Math.abs(this.slope_t)));

	// intercept

	this.intercept_se = this.rse / Math.sqrt(ssxx) / Math.sqrt(this.n) * Math.sqrt(x.pow(2).sum());
	this.intercept_t = this.intercept / this.intercept_se;
	this.intercept_p = 2 * (1 - tdistr.distr(Math.abs(this.intercept_t)));

	// R-squared
	
	this.rs = Math.pow(ssxy, 2) / (ssxx * ssyy);

};

module.exports.LinearRegression = LinearRegression;