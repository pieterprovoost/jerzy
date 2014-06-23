var vector = require('./vector');
var t = require('./t');
var misc = require('./misc');
var distributions = require('./distributions');
var regression = require('./regression');
var numeric = require('./numeric');

module.exports.Vector = vector.Vector;
module.exports.Sequence = vector.Sequence;
module.exports.StudentT = t.StudentT;
module.exports.Misc = misc.Misc;
module.exports.Numeric = numeric.Numeric;
module.exports.Normal = distributions.Normal;
module.exports.StandardNormal = distributions.StandardNormal;
module.exports.T = distributions.T;
module.exports.LinearRegression = regression.LinearRegression;