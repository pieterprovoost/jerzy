var distributions = require('./distributions');

Power = function() {};

/*
 * Sample size calculation
 */

Power.sampleSize = function(a, power, sd, effect) {
	var n = new distributions.Normal(0, 1);
	return (2 * Math.pow(n.inverse(1 - a / 2) + n.inverse(power), 2) * Math.pow(sd, 2)) / Math.pow(effect, 2);
};

module.exports.Power = Power;
