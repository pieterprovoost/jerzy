'use strict';

var deferred  = require('deferred')
  , delay     = deferred.delay
  , promisify = deferred.promisify
  , isBuffer  = Buffer.isBuffer
  , fs        = require('fs')
  , resolve   = require('path').resolve
  , open      = promisify(fs.open)
  , write     = promisify(fs.write)
  , close     = promisify(fs.close)
  , writeFile = promisify(fs.writeFile)
  , unlink    = promisify(fs.unlink)

  , pgPath = resolve(__dirname, './__playground/read-file');

module.exports = function (t) {
	var DELAY = 100;

	return {
		"Regular": {
			"Doesn't exist": function (a, d) {
				t(resolve(pgPath, 'fake'))(a.never, function (err) {
					a(err.code, 'ENOENT');
				}).done(d, d);
			},
			"Exists": function (a, d) {
				t(resolve(pgPath, 'test'))(function (data) {
					a(isBuffer(data), true, "Buffer returned");
					a(String(data), 'raz\ndwa', "Content");
				}, a.never).done(d, d);
			},
			"Encoding": function (a, d) {
				t(resolve(pgPath, 'test'), 'utf8')(function (data) {
					a(data, 'raz\ndwa');
				}, a.never).done(d, d);
			},
			"Loose": {
				"Doesn't exist": function (a, d) {
					t(resolve(pgPath, 'fake'), { loose: true })(function (data) {
						a(data, null);
					}, a.never).done(d, d);
				},
				"Exists": function (a, d) {
					t(resolve(pgPath, 'test'), { loose: true })(function (data) {
						a(String(data), 'raz\ndwa');
					}, a.never).done(d, d);
				}
			}
		},
		"Watch": {
			"Regular": {
				"Doesn't exist": function (a, d) {
					t(resolve(pgPath, 'fake'), { watch: true })(a.never, function (err) {
						a(err.code, 'ENOENT');
					}).done(d, d);
				},
				"Exists": function (a, d) {
					var path = resolve(pgPath, 'watch-test'), invoked, ended, watcher;
					return writeFile(path, 'one\ntwo')(delay(function () {
						invoked = false;
						ended = false;
						watcher = t(path, { watch: true });
						watcher.on('change', function (data) {
							a(invoked, false, "Expected invoke");
							invoked = data;
						});
						watcher.on('end', function () {
							ended = true;
						});
						return watcher;
					}, DELAY))(delay(function (data) {
						a(isBuffer(data), true, "Buffer returned");
						a(String(data), 'one\ntwo', "Content");
						return open(path, 'a')(function (fd) {
							return write(fd, new Buffer('\nthree\n'), 0, 7,
								null)(function () {
								return close(fd);
							});
						});
					}, DELAY))(delay(function () {
						a(isBuffer(invoked), true, "Emitted buffer");
						a(String(invoked), 'one\ntwo\nthree\n', "Buffer data");
						invoked = false;
						return open(path, 'a')(function (fd) {
							return write(fd, new Buffer(''), 0, 0,
								null)(function () {
								return close(fd);
							});
						});
					}, DELAY))(delay(function () {
						a(invoked, false, "Update without change");
						a(ended, false, "Not ended");
						return unlink(path);
					}, DELAY))(delay(function () {
						a(ended, true, "Watcher ended");
					}, DELAY)).done(d, d);
				}
			},
			"Loose": function (a, d) {
				var path = resolve(pgPath, 'watch-loose-test'), invoked, ended, watcher;
				invoked = false;
				ended = false;
				watcher = t(path, { watch: true, loose: true });
				watcher.on('change', function (data) {
					a(invoked, false, "Expected invoke");
					invoked = data;
				});
				watcher.on('end', function () {
					ended = true;
				});

				return watcher(delay(function (data) {
					a(data, null, "No file yet");
					return writeFile(path, 'foo\nbar');
				}, DELAY))(delay(function () {
					a(isBuffer(invoked), true, "Emitted buffer");
					a(String(invoked), 'foo\nbar', "Emitted Content");
					invoked = false;
					return open(path, 'a')(function (fd) {
						return write(fd, new Buffer('\nfour\n'), 0, 6,
							null)(function () {
							return close(fd);
						});
					});
				}, DELAY))(delay(function () {
					a(isBuffer(invoked), true, "Emitted buffer");
					a(String(invoked), 'foo\nbar\nfour\n', "Buffer data");
					invoked = false;
					return open(path, 'a')(function (fd) {
						return write(fd, new Buffer(''), 0, 0,
							null)(function () {
							return close(fd);
						});
					});
				}, DELAY))(delay(function () {
					a(invoked, false, "Update without change");
					a(ended, false, "Not ended");
					return unlink(path);
				}, DELAY))(delay(function () {
					a(invoked, null, "Emitted null");
					invoked = false;
					return writeFile(path, 'foo\nagain');
				}, DELAY))(delay(function () {
					a(isBuffer(invoked), true, "Emitted buffer");
					a(String(invoked), 'foo\nagain', "Emitted Content");
					watcher.close();
					return unlink(path);
				}, DELAY)).done(d, d);
			}
		}
	};
};
