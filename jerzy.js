var vector = require('./lib/vector');
var t = require('./lib/t');
var misc = require('./lib/misc');
var distributions = require('./lib/distributions');
var regression = require('./lib/regression');
var correlation = require('./lib/correlation');
var numeric = require('./lib/numeric');

module.exports.Vector = vector.Vector;
module.exports.Sequence = vector.Sequence;
module.exports.StudentT = t.StudentT;
module.exports.Misc = misc.Misc;
module.exports.Numeric = numeric.Numeric;
module.exports.Normal = distributions.Normal;
module.exports.StandardNormal = distributions.StandardNormal;
module.exports.T = distributions.T;
module.exports.Regression = regression.Regression;
module.exports.Correlation = correlation.Correlation;