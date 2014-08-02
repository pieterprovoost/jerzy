'use strict';

var fs        = require('fs')
  , resolve   = require('path').resolve
  , noop      = require('es5-ext/function/noop')
  , deferred  = require('deferred')
  , delay     = deferred.delay
  , promisify = deferred.promisify
  , mkdir     = promisify(fs.mkdir)
  , writeFile = promisify(fs.writeFile)
  , unlink    = promisify(fs.unlink)
  , rmdir     = promisify(fs.rmdir)
  , modes     = require('../lib/ignore-modes')

  , pgPath = resolve(__dirname, './__playground/is-ignored');

module.exports = function (t, a, d) {
	var invoked = null, testIsRoot
	  , DELAY = 100
	  , gitRoot = resolve(pgPath, '.git')
	  , rootFile = resolve(pgPath, '.gitignore')
	  , onePath = resolve(pgPath, 'one')
	  , oneFile = resolve(onePath, '.gitignore')
	  , twoPath = resolve(onePath, 'two')
	  , twoFile = resolve(twoPath, '.gitignore')
	  , twoOtherFile = resolve(twoPath, '.ignore')
	  , twoFooPath = resolve(twoPath, 'foo')

	  , watcher;

	modes.test = {
		filename: '.ignore',
		isRoot: testIsRoot = function (path) {
			var promise = deferred(path === onePath);
			promise.close = noop;
			return promise;
		},
		isRootWatcher: testIsRoot
	};

	deferred(mkdir(gitRoot), mkdir(onePath)(function () {
		return mkdir(twoPath);
	}))(delay(function () {
		t('git', resolve(gitRoot, 'foo/bar'))(function (value) {
			a(value, true, "Ignore gitrepo file");
		}).done();
		watcher = t('git', twoFooPath, { watch: true });
		watcher.on('change', function (arg) {
			a(invoked, null, "Invoked once");
			invoked = arg;
		});
		watcher.done();
		return t('git', twoFooPath);
	}, DELAY))(delay(function (value) {
		a(value, false, "#1");
		return writeFile(rootFile, 'foo');
	}, DELAY))(delay(function () {
		a(invoked, true, "#2 event");
		invoked = null;
		return t('git', twoFooPath);
	}, DELAY))(function (value) {
		a(value, true, "#2");
		return writeFile(oneFile, '/two/foo');
	})(delay(function () {
		a(invoked, null, "#3 event");
		return t('git', twoFooPath);
	}, DELAY))(function (value) {
		a(value, true, "#3");
		return writeFile(twoFile, '!foo');
	})(delay(function () {
		a(invoked, false, "#4 event");
		invoked = null;
		return t('git', twoFooPath);
	}, DELAY))(function (value) {
		a(value, false, "#4");
		return deferred(unlink(rootFile), unlink(oneFile));
	})(delay(function () {
		a(invoked, null, "#5 event");
		return t('git', twoFooPath);
	}, DELAY))(function (value) {
		a(value, false, "#5");
		return unlink(twoFile);
	})(delay(function () {
		a(invoked, null, "#6 event");
		invoked = null;
		return t('git', twoFooPath);
	}, DELAY))(function (value) {
		a(value, false, "#6");
		return writeFile(oneFile, '/two/foo\n!/two/foo');
	})(delay(function () {
		a(invoked, null, "#7 event");
		invoked = null;
		return t('git', twoFooPath);
	}, DELAY))(function (value) {
		a(value, false, "#7");
		return writeFile(rootFile, 'two');
	})(delay(function () {
		a(invoked, true, "#8 event");
		invoked = null;
		return t('git', twoFooPath);
	}, DELAY))(function (value) {
		a(value, true, "#8");
		return unlink(rootFile);
	})(delay(function () {
		a(invoked, false, "#9 event");
		invoked = null;
		return t('git', twoFooPath);
	}, DELAY))(function (value) {
		a(value, false, "#9");
		return writeFile(rootFile, '/one');
	})(delay(function () {
		a(invoked, true, "#10 event");
		invoked = null;
		return t('git', twoFooPath);
	}, DELAY))(function (value) {
		a(value, true, "#10");
		watcher.close();
		return deferred(writeFile(rootFile, 'one\n!one/two/foo'), unlink(oneFile));
	})(delay(function () {
		a(invoked, null, "#11 event");
		invoked = null;
		return t('git', twoFooPath);
	}, DELAY))(function (value) {
		a(value, true, "#11");

		return unlink(rootFile);
	})(delay(function () {
		invoked = null;

		watcher = t(['git', 'test'], twoFooPath, { watch: true });
		watcher.on('change', function (arg) {
			a(invoked, null, "Invoked once");
			invoked = arg;
		});
		watcher.done();
		return t('git', twoFooPath);
	}, DELAY))(function (value) {
		a(value, false, "Both #1");
		return writeFile(rootFile, 'foo');
	})(delay(function () {
		a(invoked, true, "Both #2");
		invoked = null;
		return t(['git', 'test'], twoFooPath);
	}, DELAY * 2))(function (value) {
		a(value, true, "Both #2");
		return writeFile(twoOtherFile, '!foo');
	})(delay(function () {
		a(invoked, false, "Both #3");
		invoked = null;
		return t(['git', 'test'], twoFooPath);
	}, DELAY))(function (value) {
		a(value, false, "Both #3");
		return writeFile(rootFile, 'one\n');
	})(delay(function () {
		a(invoked, true, "Both #4");
		invoked = null;
		return t(['git', 'test'], twoFooPath);
	}, DELAY))(function (value) {
		a(value, true, "Both #4");
		return unlink(rootFile);
	})(delay(function () {
		a(invoked, false, "Both #5");
		invoked = null;
		return t(['git', 'test'], twoFooPath);
	}, DELAY))(function (value) {
		a(value, false, "Both #5");
		return writeFile(twoOtherFile, 'foo');
	})(delay(function () {
		a(invoked, true, "Both #6");
		invoked = null;
		return t(['git', 'test'], twoFooPath);
	}, DELAY))(function (value) {
		a(value, true, "Both #6");
		return writeFile(twoFile, '!foo');
	})(delay(function () {
		a(invoked, null, "Both #7");
		invoked = null;
		return t(['git', 'test'], twoFooPath);
	}, DELAY))(function (value) {
		a(value, true, "Both #7");
		return writeFile(twoOtherFile, '!foo');
	})(delay(function () {
		a(invoked, false, "Both #8");
		invoked = null;
		return t(['git', 'test'], twoFooPath);
	}, DELAY))(function (value) {
		a(value, false, "Both #8");
		return writeFile(twoFile, 'foo');
	})(delay(function () {
		a(invoked, null, "Both #9");
		invoked = null;
		return t(['git', 'test'], twoFooPath);
	}, DELAY))(function (value) {
		a(value, false, "Both #9");
		watcher.close();
	})(delay(function () {
		return deferred(unlink(twoFile), unlink(twoOtherFile));
	}, DELAY))(delay(function () {

		t(null, twoFooPath, { globalRules: 'foo' })(function (value) {
			a(value, true, "Global: Direct");
		});
		t(null, twoFooPath, { globalRules: ['one'] })(function (value) {
			a(value, true, "Global: Upper");
		});
		t(null, twoFooPath, { globalRules: ['bar'] })(function (value) {
			a(value, false, "Global: Not matching");
		});
		delete modes.test;
		return deferred(rmdir(gitRoot), rmdir(twoPath)(function () {
			return rmdir(onePath);
		}))(false);
	}, DELAY)).done(d, d);
};
