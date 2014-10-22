'use strict';

var last = require('es5-ext/array/#/last')

  , stringify = JSON.stringify, min = Math.min
  , wsRe = /\s/
  , eolRe = /(?:\r\n|[\n\r\u2028\u2029])/
  , current = 0, str1 = -1, str2 = -1, slash = -1, require = -1, code = '', deps
  , requireRe, breakers, update
  , pass, passComment, passMultiComment, passRegExp, passRequire;

requireRe = new RegExp('^\\s*(\'(?:[\\0-\\t\\v\\f\\u000e-&\\(-\\u2027\\u2030-' +
	'\\uffff]|\\\\[\\0-\\uffff])*\'|"(?:[\\0-\\t\\v\\f\\u000e-!#-\\u2027' +
	'\\u2030-\\uffff]|\\\\[\\0-\\uffff])*")\\s*\\)');

breakers = ['=', ';', '(', '[', '{', ',', '<', '>', '+', '-', '*', '/', '%',
	'&', '|', '^', '!', '~', '?', ':'];

update = (function () {
	var update = function (index, token) {
		var val = index;
		if (index < current) {
			if ((val = code.indexOf(token, current)) === -1) {
				val = Infinity;
			}
		}
		return val;
	};
	return function () {
		str1 = update(str1, "'");
		str2 = update(str2, '"');
		slash = update(slash, '/');
		require = update(require, 'require');
	};
}());

pass = function (point, token) {
	var str, escape;
	escape = point - 1;
	do {
		point = escape + 2;
		escape = code.indexOf('\\', point);
		str = code.indexOf(token, point);
	} while ((escape !== -1) && (str !== -1) && (escape < str));
	if (str !== -1) {
		current = str + 1;
		return false;
	}
	return true;
};

passComment = function () {
	current = (code.indexOf('\n', slash + 2) + 1);
	return !current;
};

passMultiComment = function () {
	current = (code.indexOf('*/', slash + 2) + 2);
	return (current <= 1);
};

passRegExp = function () {
	var point = slash - 1, chr, e;
	while ((point >= 0) && wsRe.test(chr = code[point])) --point;
	if ((point >= 0) && (breakers.indexOf(chr) === -1)) {
		if (chr === '}') {
			// Unlikely corner case
			e = new Error("Cannot parse code. Found ambiguous '/' usage" +
				" @" + (point + 1) + ": " +
				stringify(code.slice(point, point + 10)) + ". " +
				"Try AST parser instead.");
			e.type = 'slash-ambiguity';
			e.at = point + 1;
			throw e;
		}
		// not RegExp
		current = slash + 1;
		return false;
	}
	return pass(slash, '/');
};

passRequire = (function () {
	var parseRequire, argsError;

	parseRequire = function () {
		var match, value, dep, lines;
		match = code.slice(current).match(requireRe);
		if (!match) throw argsError();
		try {
			value = new Function("'use strict'; return " + match[1])();
		} catch (e) {
			throw argsError();
		}
		deps.push(dep = {
			value: value,
			raw: match[1],
			point: code.indexOf('(', current - 1) + 2
		});
		lines = code.slice(0, dep.point).split(eolRe);
		dep.line = lines.length;
		dep.column = last.call(lines).length;
		current += match[0].length;
	};

	argsError = function () {
		var e = new Error("Cannot parse code @" + current + ": " +
			stringify(code.slice(current - 8, current + 10)) + "." +
			" Found unexpected code in `require` call. Try AST parser instead.");
		e.type = 'require-args';
		e.at = current;
		return e;
	};

	return function () {
		var point = require - 1, chr, eol, ws, e;
		current = require + 'require'.length;
		while (wsRe.test(code[current])) ++current;
		if (code[current] !== '(') return;
		++current;
		while ((point >= 0) && wsRe.test(chr = code[point]) &&
				!(eol = eolRe.test(chr))) {
			--point;
			ws = true;
			eol = false;
		}
		if (eol) {
			--point;
			while ((point >= 0) && wsRe.test(chr = code[point])) --point;
			if ((point >= 0) && (chr === '.')) return;
		} else if ((point >= 0) && (breakers.indexOf(chr) === -1)) {
			if (chr !== '}') {
				if (!ws) return;
				e = new Error("Cannot parse code @" + require + ": " +
					stringify(code.slice(require - 8, require + 17)) + "." +
					" `require` preceded by unexpected code. Try AST parser instead.");
				e.at = require;
				e.type = 'require-preced';
				throw e;
			}
			// require after end of declaration block or syntax error
			// we assume end of declaration block
		}
		parseRequire();
	};
}());

module.exports = function (moduleCode) {
	var next, chr, length;
	code = String(moduleCode);
	length = code.length;
	deps = [];

	current = 0;
	str1 = str2 = slash = require = -1;
	while (current < length) {
		update();
		if (require === Infinity) return deps;
		next = min(str1, str2, slash, require);
		if (next === str1) {
			if (pass(str1, '\'')) return deps;
		} else if (next === str2) {
			if (pass(str2, '"')) return deps;
		} else if (next === slash) {
			chr = code[slash + 1];
			if (chr === '/') {
				if (passComment()) return deps;
			} else if (chr === '*') {
				if (passMultiComment()) return deps;
			} else if (passRegExp()) {
				return deps;
			}
		} else {
			passRequire();
		}
	}
	return deps;
};
