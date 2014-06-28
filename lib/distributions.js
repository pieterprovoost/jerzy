var vector = require('./vector');
var misc = require('./misc');

/*
 * Normal distribution
 */

Normal = function(mean, variance) {
	this.mean = mean;
	this.variance = variance;
};

Normal.prototype._de = function(x) {
	return (1 / (Math.sqrt(this.variance) * (Math.sqrt(2 * Math.PI)))) 
		* Math.exp(-(Math.pow(x - this.mean, 2)) / (2 * this.variance))
};

Normal.prototype.dens = function(arg) {
	if (arg instanceof vector.Vector) {
		result = new vector.Vector([]);
		for (var i = 0; i < arg.length(); ++i) {
			result.push(this._de(arg.elements[i]));
		}
		return result;
	} else {
		return this._de(arg);
	}
};

/*
 * Standard Normal distribution
 */

StandardNormal.prototype = new Normal();

StandardNormal.prototype.constructor = StandardNormal;

function StandardNormal() {
	this.mean = 0;
	this.variance = 1;
};

/*
 * T distribution
 */

T = function(df) {
	this.df = df;
};

T.prototype._de = function(x) {
	return (misc.Misc.gamma((this.df + 1) / 2) / (Math.sqrt(this.df * Math.PI) * misc.Misc.gamma(this.df / 2))) 
		* Math.pow((1 + Math.pow(x, 2) / this.df), -(this.df + 1) / 2);
};

T.prototype._di = function(x) {
	if (x < 0) {
		return 0.5 * misc.Misc.rbeta(this.df / (Math.pow(x, 2) + this.df), this.df / 2, 0.5);
	} else {
		return 1 - 0.5 * misc.Misc.rbeta(this.df / (Math.pow(x, 2) + this.df), this.df / 2, 0.5);
	}
};

T.prototype.dens = function(arg) {
	if (arg instanceof vector.Vector) {
		result = new vector.Vector([]);
		for (var i = 0; i < arg.length(); ++i) {
			result.push(this._de(arg.elements[i]));
		}
		return result;
	} else {
		return this._de(arg);
	}
};

T.prototype.distr = function(arg) {
	if (arg instanceof vector.Vector) {
		result = new vector.Vector([]);
		for (var i = 0; i < arg.length(); ++i) {
			result.push(this._di(arg.elements[i]));
		}
		return result;
	} else {
		return this._di(arg);
	}
};

module.exports.Normal = Normal;
module.exports.StandardNormal = StandardNormal;
module.exports.T = T;