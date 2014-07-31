var distributions = require('./distributions');

Confidence = function() {};

Confidence.confidence = function(x, p) {
	var t = new distributions.T(x.length() - 1);
	console.log("mean", x.mean());
	console.log("sem", x.sem());
	var lower = x.mean() - t.inverse(0.5 + p / 2) * x.sem();
	var upper = x.mean() + t.inverse(0.5 + p / 2) * x.sem();
	return [lower, upper];
};

module.exports.Confidence = Confidence;