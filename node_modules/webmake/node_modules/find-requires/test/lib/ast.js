'use strict';

var readFile = require('fs').readFile
  , resolve  = require('path').resolve

  , pg = resolve(__dirname, '../__playground');

module.exports = function (t, a, d) {
	var result = ['one', '12', 'thr/ee', 'fo\\ur', 'five', 'six', 'seven',
		'undefined', 'eight', 'nine', 'ten', 'elevensplitpath', 'twelve',
		'fourteen', 'fifteen', 'sixteen', 'seventeen', '\'eighteen\'', 'nineteen',
		'twenty', 'twenty/one', 'twenty/two', 'twenty/three', '/twenty/two/2/',
		'twenty/three/2/', 'twenty/four/2/\'', 'twenty/five/2/"',
		'\'twenty/seven\'', '"twenty/eight', '"twenty/nine"', '"thirty"',
		'mid-thirty', 'marko', 'thirty\tbreak-line \tone', 'thirty\two'];

	readFile(pg + '/edge.js', 'utf-8', function (err, str) {
		var astR, other = [];
		if (err) {
			d(err);
			return;
		}
		astR = t(str);

		a.deep(astR.map(function (r) {
			if (r.value == null) other.push(r.raw);
			return r.value;
		}).filter(function (value) {
			return value != null;
		}), result, "Result");
		if (astR.length !== result.length) {
			d();
			return;
		}
		a(astR[0].point, 9, "Point");
		a(astR[0].line, 1, "Line");
		a(astR[0].column, 9, "Column");
		a(astR[0].raw, "'on\\u0065'", "Raw");
		a.deep(other, ['baz', '"object3" + { foo: bar() }',
			'require(\'marko\')',
			'\'inner\' + require(require(\'marko\')) + ' +
			'\'elo\''], "Unread");
		d();
	});
};
