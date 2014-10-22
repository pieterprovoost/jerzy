'use strict';

var push       = Array.prototype.push
  , fs         = require('fs')
  , path       = require('path')
  , aFrom      = require('es5-ext/array/from')
  , diff       = require('es5-ext/array/#/diff')
  , startsWith = require('es5-ext/string/#/starts-with')
  , deferred   = require('deferred')
  , delay      = deferred.delay
  , promisify  = deferred.promisify
  , mkdir      = promisify(fs.mkdir)
  , writeFile  = promisify(fs.writeFile)
  , unlink     = promisify(fs.unlink)
  , rmdir      = promisify(fs.rmdir)

  , basename = path.basename, resolve = path.resolve, sep = path.sep

  , pgPath = resolve(__dirname, './__playground/readdir');

module.exports = function (t) {
	var pathsAll, paths2, paths0, files2, replaceSep, DELAY = 100;
	replaceSep = function (path) {
		return path.replace(/\//g, sep);
	};
	pathsAll = [ 'done', 'done/done', 'done/done/dthree',
		'done/done/dthree/dthree', 'done/done/dthree/dthree/foo',
		'done/done/dthree/dtwo', 'done/done/dthree/dtwo/foo',
		'done/done/dthree/one', 'done/done/dthree/three', 'done/done/dthree/two',
		'done/done/dtwo', 'done/done/dtwo/dtwo', 'done/done/dtwo/dtwo/foo',
		'done/done/dtwo/one', 'done/done/dtwo/three', 'done/done/dtwo/two',
		'done/done/one', 'done/done/three', 'done/done/two', 'done/dtwo',
		'done/dtwo/foo', 'done/one', 'done/three', 'done/two', 'dthree',
		'dthree/dthree', 'dthree/dthree/done', 'dthree/dthree/done/dthree',
		'dthree/dthree/done/dthree/foo', 'dthree/dthree/done/one',
		'dthree/dthree/done/three', 'dthree/dthree/done/two', 'dthree/dthree/one',
		'dthree/dthree/three', 'dthree/dthree/two', 'dthree/dtwo',
		'dthree/dtwo/foo', 'dthree/one', 'dthree/three', 'dthree/two', 'dtwo',
		'dtwo/one', 'dtwo/three', 'dtwo/two', 'one', 'three', 'two']
		.map(replaceSep);

	paths2 = pathsAll.filter(function (path) {
		return path.split(sep).length < 4;
	});

	paths0 = pathsAll.filter(function (path) {
		return path.split(sep).length < 2;
	});

	files2 = paths2.filter(function (path) {
		return basename(path)[0] !== 'd';
	});

	return {
		"": {
			"0": function (a, d) {
				var reader = t(pgPath, { watch: true })
				  , testName = 'foo'
				  , testPath = resolve(pgPath, testName)
				  , paths = paths0
				  , invoked = false;

				reader.on('change', function (data) {
					invoked = data;
				});
				reader(delay(function (data) {
					a.deep(data.sort(), paths);
					return mkdir(testPath);
				}, DELAY * 2))(delay(function () {
					a.deep(invoked.removed, [], "Created: removed");
					a.deep(invoked.added, [testName], "Created: added");
					invoked = false;
					reader(function (data) {
						var npaths = aFrom(paths);
						npaths.push(testName);
						a.deep(data.sort(), npaths.sort(), "Created: data");
					}).done();
					return t(pgPath);
				}, DELAY))(function (data) {
					var npaths = aFrom(paths);
					npaths.push(testName);
					a.deep(data.sort(), npaths.sort(), "Not watched");
					return rmdir(testPath);
				})(delay(function () {
					a.deep(invoked.removed, [testName], "Deleted: removed");
					a.deep(invoked.added, [], "Deleted: added");
					invoked = false;
					reader(function (data) {
						a.deep(data.sort(), paths, "Deleted: data");
					}).done();
					reader.close();
				}, DELAY)).done(d, d);
			},
			"2": function (a, d) {
				var reader = t(pgPath, { depth: 2, watch: true })
				  , testName = replaceSep('dtwo/foo')
				  , testPath = resolve(pgPath, testName)
				  , paths = paths2
				  , invoked = false;

				reader.on('change', function (data) {
					invoked = data;
				});
				reader(function (data) {
					a.deep(data.sort(), paths);
				})(delay(function () {
					return mkdir(testPath);
				}, DELAY))(delay(function () {
					a.deep(invoked.removed, [], "Created: removed");
					a.deep(invoked.added, [testName], "Created: added");
					invoked = false;
					reader(function (data) {
						var npaths = aFrom(paths);
						npaths.push(testName);
						a.deep(data.sort(), npaths.sort(), "Created: data");
					}).done();
					return t(pgPath, { depth: 2 });
				}, DELAY))(function (data) {
					var npaths = aFrom(paths);
					npaths.push(testName);
					a.deep(data.sort(), npaths.sort(), "Not watched");
					return rmdir(testPath);
				})(delay(function () {
					a.deep(invoked.removed, [testName], "Deleted: removed");
					a.deep(invoked.added, [], "Deleted: added");
					invoked = false;
					reader(function (data) {
						a.deep(data.sort(), paths, "Deleted: data");
					}).done();
					reader.close();
				}, DELAY)).done(d, d);
			},
			"∞": function (a, d) {
				var reader = t(pgPath, { depth: Infinity, watch: true })
				  , testName = replaceSep('done/done/dthree/test')
				  , testPath = resolve(pgPath, testName)
				  , paths = pathsAll
				  , invoked = false;

				reader.on('change', function (data) {
					invoked = data;
				});
				reader(function (data) {
					a.deep(data.sort(), paths);
				})(delay(function () {
					return writeFile(testPath, 'foo');
				}, DELAY))(delay(function () {
					a.deep(invoked.removed, [], "Created: removed");
					a.deep(invoked.added, [testName], "Created: added");
					invoked = false;
					reader(function (data) {
						var npaths = aFrom(paths);
						npaths.push(testName);
						a.deep(data.sort(), npaths.sort(), "Created: data");
					}).done();
					return t(pgPath, { depth: Infinity });
				}, DELAY))(function (data) {
					var npaths = aFrom(paths);
					npaths.push(testName);
					a.deep(data.sort(), npaths.sort(), "Not watched");
					return unlink(testPath);
				})(delay(function () {
					a.deep(invoked.removed, [testName], "Deleted: removed");
					a.deep(invoked.added, [], "Deleted: added");
					invoked = false;
					reader(function (data) {
						a.deep(data.sort(), paths, "Deleted: data");
					}).done();
					reader.close();
				}, DELAY)).done(d, d);
			}
		},
		"Progress events": function (a, d) {
			var reader = t(pgPath, { depth: Infinity, stream: true })
			  , result = []
			  , lengths = []
			  , count = 0;

			reader.on('change', function (data) {
				++count;
				lengths.push(data.added.length);
				a.deep(data.removed, [], "Removed #" + count);
				push.apply(result, data.added);
				a.deep(result.sort(), data.data.sort(), "Data #" + count);
			});
			reader(function (data) {
				a.deep(lengths.sort(),
					[1, 1, 1, 1, 1, 1, 3, 4, 4, 4, 5, 5, 5, 5, 6], "Events");
				a.deep(result.sort(), data.sort(), "Result");
			}).done(d, d);
		},
		"Type": function (a, d) {
			var reader = t(pgPath, { depth: 2, type: { file: true }, watch: true })
			  , testName = replaceSep('dtwo/test')
			  , testPath = resolve(pgPath, testName)
			  , paths = files2
			  , invoked = false;

			reader.on('change', function (data) {
				invoked = data;
			});
			reader(function (data) {
				a.deep(data.sort(), paths);
				return mkdir(testPath);
			})(delay(function () {
				a(invoked, false, "Created other type: event");
				invoked = false;
				reader(function (data) {
					a.deep(data.sort(), paths, "Created other type: data");
				}).done();
				return rmdir(testPath);
			}, DELAY))(delay(function () {
				a(invoked, false, "Deleted other type: event");
				invoked = false;
				reader(function (data) {
					a.deep(data.sort(), paths, "Deleted other type: data");
				}).done();
				return writeFile(testPath, 'foo');
			}, DELAY))(delay(function () {
				a.deep(invoked.removed, [], "Created: removed");
				a.deep(invoked.added, [testName], "Created: added");
				invoked = false;
				reader(function (data) {
					var npaths = aFrom(paths);
					npaths.push(testName);
					a.deep(data.sort(), npaths.sort(), "Created: data");
				}).done();
				return t(pgPath, { depth: 2, type: { file: true } });
			}, DELAY))(function (data) {
				var npaths = aFrom(paths);
				npaths.push(testName);
				a.deep(data.sort(), npaths.sort(), "Not watched");
				return unlink(testPath);
			})(delay(function () {
				a.deep(invoked.removed, [testName], "Deleted: removed");
				a.deep(invoked.added, [], "Deleted: added");
				invoked = false;
				reader(function (data) {
					a.deep(data.sort(), paths, "Deleted: data");
				}).done();
				reader.close();
			}, DELAY)).done(d, d);
		},
		"Types": function (a, d) {
			var reader = t(pgPath, { depth: 2,
				type: { file: true, directory: true }, watch: true })
			  , testName = replaceSep('dtwo/foo')
			  , testPath = resolve(pgPath, testName)
			  , paths = paths2
			  , invoked = false;

			reader.on('change', function (data) {
				invoked = data;
			});
			reader(delay(function (data) {
				a.deep(data.sort(), paths);
				return mkdir(testPath);
			}, DELAY))(delay(function () {
				a.deep(invoked.removed, [], "Created: removed");
				a.deep(invoked.added, [testName], "Created: added");
				invoked = false;
				reader(function (data) {
					var npaths = aFrom(paths);
					npaths.push(testName);
					a.deep(data.sort(), npaths.sort(), "Created: data");
				}).done();
				return t(pgPath, { depth: 2, type: { file: true, directory: true } });
			}, DELAY))(function (data) {
				var npaths = aFrom(paths);
				npaths.push(testName);
				a.deep(data.sort(), npaths.sort(), "Not watched");
				return rmdir(testPath);
			})(delay(function () {
				a.deep(invoked.removed, [testName], "Deleted: removed");
				a.deep(invoked.added, [], "Deleted: added");
				invoked = false;
				reader(function (data) {
					a.deep(data.sort(), paths, "Deleted: data");
				}).done();
				reader.close();
			}, DELAY)).done(d, d);
		},
		"Pattern": function (a, d) {
			var pattern = /one$/
			  , reader = t(pgPath, { depth: 2, pattern: pattern, watch: true })
			  , otherName = replaceSep('dtwo/test')
			  , otherPath = resolve(pgPath, otherName)
			  , testName = replaceSep('dtwo/fooone')
			  , testPath = resolve(pgPath, testName)
			  , paths = paths2.filter(function (path) {
				return pattern.test(path);
			})
			  , invoked = false;

			reader.on('change', function (data) {
				invoked = data;
			});
			reader(function (data) {
				a.deep(data.sort(), paths);
				return mkdir(otherPath);
			})(delay(function () {
				a(invoked, false, "Created other type: event");
				invoked = false;
				reader(function (data) {
					a.deep(data.sort(), paths, "Created other type: data");
				}).done();
				return rmdir(otherPath);
			}, DELAY))(delay(function () {
				a(invoked, false, "Deleted other type: event");
				invoked = false;
				reader(function (data) {
					a.deep(data.sort(), paths, "Deleted other type: data");
				}).done();
				return mkdir(testPath);
			}, DELAY))(delay(function () {
				a.deep(invoked.removed, [], "Created: removed");
				a.deep(invoked.added, [testName], "Created: added");
				invoked = false;
				reader(function (data) {
					var npaths = aFrom(paths);
					npaths.push(testName);
					a.deep(data.sort(), npaths.sort(), "Created: data");
				}).done();
				return t(pgPath, { depth: 2, pattern: pattern });
			}, DELAY))(function (data) {
				var npaths = aFrom(paths);
				npaths.push(testName);
				a.deep(data.sort(), npaths.sort(), "Not watched");
				return rmdir(testPath);
			})(delay(function () {
				a.deep(invoked.removed, [testName], "Deleted: removed");
				a.deep(invoked.added, [], "Deleted: added");
				invoked = false;
				reader(function (data) {
					a.deep(data.sort(), paths, "Deleted: data");
				}).done();
				reader.close();
			}, DELAY)).done(d, d);
		},
		"Global rules": function (a, d) {
			var rules = ['one']
			  , re = /(?:^|\/|\\)one(?:\/|\\|$)/
			  , reader = t(pgPath, { depth: 2, globalRules: rules, watch: true })
			  , otherName = replaceSep('dthree/dtwo/one')
			  , otherPath = resolve(pgPath, otherName)
			  , testName = replaceSep('dtwo/fooone')
			  , testPath = resolve(pgPath, testName)
			  , paths = paths2.filter(function (path) {
				return !re.test(path);
			})
			  , invoked = false;

			reader.on('change', function (data) {
				invoked = data;
			});
			reader(function (data) {
				a.deep(data.sort(), paths);
				return mkdir(otherPath);
			})(delay(function () {
				a(invoked, false, "Created other type: event");
				invoked = false;
				reader(function (data) {
					a.deep(data.sort(), paths, "Created other type: data");
				}).done();
				return rmdir(otherPath);
			}, DELAY))(delay(function () {
				a(invoked, false, "Deleted other type: event");
				invoked = false;
				reader(function (data) {
					a.deep(data.sort(), paths, "Deleted other type: data");
				}).done();
				return mkdir(testPath);
			}, DELAY))(delay(function () {
				a.deep(invoked.removed, [], "Created: removed");
				a.deep(invoked.added, [testName], "Created: added");
				invoked = false;
				reader(function (data) {
					var npaths = aFrom(paths);
					npaths.push(testName);
					a.deep(data.sort(), npaths.sort(), "Created: data");
				}).done();
				return t(pgPath, { depth: 2, globalRules: rules });
			}, DELAY))(function (data) {
				var npaths = aFrom(paths);
				npaths.push(testName);
				a.deep(data.sort(), npaths.sort(), "Not watched");
				return rmdir(testPath);
			})(delay(function () {
				a.deep(invoked.removed, [testName], "Deleted: removed");
				a.deep(invoked.added, [], "Deleted: added");
				invoked = false;
				reader(function (data) {
					a.deep(data.sort(), paths, "Deleted: data");
				}).done();
				reader.close();
			}, DELAY)).done(d, d);
		},
		"Pattern & Type": function (a, d) {
			var pattern = /one$/, reader = t(pgPath,
				{ depth: 2, type: { file: true }, pattern: pattern, watch: true })
			  , testName = replaceSep('dtwo/fooone')
			  , testPath = resolve(pgPath, testName)
			  , paths = files2.filter(function (path) {
				return pattern.test(path);
			})
			  , invoked = false;

			reader.on('change', function (data) {
				invoked = data;
			});
			reader(delay(function (data) {
				a.deep(data.sort(), paths);
				return mkdir(testPath);
			}, DELAY))(delay(function () {
				a(invoked, false, "Created other type: event");
				invoked = false;
				reader(function (data) {
					a.deep(data.sort(), paths, "Created other type: data");
				}).done();
				return rmdir(testPath);
			}, DELAY))(delay(function () {
				a(invoked, false, "Deleted other type: event");
				invoked = false;
				reader(function (data) {
					a.deep(data.sort(), paths, "Deleted other type: data");
				}).done();
				return writeFile(testPath, 'foo');
			}, DELAY))(delay(function () {
				a.deep(invoked.removed, [], "Created: removed");
				a.deep(invoked.added, [testName], "Created: added");
				invoked = false;
				reader(function (data) {
					var npaths = aFrom(paths);
					npaths.push(testName);
					a.deep(data.sort(), npaths.sort(), "Created: data");
				}).done();
				return t(pgPath, { depth: 2, type: { file: true }, pattern: pattern });
			}, DELAY))(function (data) {
				var npaths = aFrom(paths);
				npaths.push(testName);
				a.deep(data.sort(), npaths.sort(), "Not watched");
				return unlink(testPath);
			})(delay(function () {
				a.deep(invoked.removed, [testName], "Deleted: removed");
				a.deep(invoked.added, [], "Deleted: added");
				invoked = false;
				reader(function (data) {
					a.deep(data.sort(), paths, "Deleted: data");
				}).done();
				reader.close();
			}, DELAY)).done(d, d);
		},
		"Ignored": function (a, d) {
			var gitPath = resolve(pgPath, '.git')
			  , ignoreFile = resolve(pgPath, '.gitignore')
			  , otherName = replaceSep('dtwo/test')
			  , otherPath = resolve(pgPath, otherName)
			  , testName = replaceSep('dthree/fooone')
			  , testPath = resolve(pgPath, testName)
			  , paths = paths2.filter(function (path) {
				return path.indexOf('dtwo') === -1;
			})
			  , reader, invoked = [], mergeInvoked, npaths;

			mergeInvoked = function () {
				var result;
				if (!invoked.length) {
					return false;
				}
				result = { data: invoked[0].data, removed: [], added: [] };
				invoked.forEach(function (data) {
					push.apply(result.added, data.added);
					push.apply(result.removed, data.removed);
				});
				invoked = [];
				return result;
			};

			paths.push('.gitignore');
			paths.sort();

			npaths = paths.filter(function (path) {
				return (path !== 'one') && (path.indexOf(sep + 'one') === -1) &&
					!startsWith.call(path, 'dthree' + sep + 'dthree');
			});

			deferred(mkdir(gitPath), writeFile(ignoreFile, 'dtwo'))(delay(
				function () {
					reader = t(pgPath, { depth: 2, ignoreRules: 'git', watch: true });
					reader.on('change', function (data) {
						invoked.push(data);
					});
					return reader;
				},
				DELAY
			))(function (data) {
				a.deep(data.sort(), paths);
				return mkdir(otherPath);
			})(delay(function () {
				var invoked = mergeInvoked();
				a(invoked, false, "Created other type: event");
				reader(function (data) {
					a.deep(data.sort(), paths, "Created other type: data");
				}).done();
				return rmdir(otherPath);
			}, DELAY))(delay(function () {
				var invoked = mergeInvoked();
				a(invoked, false, "Deleted other type: event");
				reader(function (data) {
					a.deep(data.sort(), paths, "Deleted other type: data");
				}).done();
				return mkdir(testPath);
			}, DELAY))(delay(function () {
				var invoked = mergeInvoked();
				a.deep(invoked.removed, [], "Created: removed");
				a.deep(invoked.added, [testName], "Created: added");
				reader(function (data) {
					var npaths = aFrom(paths);
					npaths.push(testName);
					a.deep(data.sort(), npaths.sort(), "Created: data");
				}).done();
				return t(pgPath, { depth: 2, ignoreRules: 'git' });
			}, DELAY))(function (data) {
				var npaths = aFrom(paths);
				npaths.push(testName);
				a.deep(data.sort(), npaths.sort(), "Not watched");
				return rmdir(testPath);
			})(delay(function () {
				var invoked = mergeInvoked();
				a.deep(invoked.removed, [testName], "Deleted: removed");
				a.deep(invoked.added, [], "Deleted: added");
				reader(function (data) {
					a.deep(data.sort(), paths, "Deleted: data");
				}).done();
				return writeFile(ignoreFile, 'dtwo\none\n/dthree/dthree');
			}, DELAY))(delay(function () {
				var invoked = mergeInvoked();
				a.deep(invoked && invoked.removed && invoked.removed.sort(),
					diff.call(paths, npaths).sort(),
					"Ignored: removed");
				a.deep(invoked.added, [], "Ignored: added");
				reader(function (data) {
					a.deep(data.sort(), npaths, "Ignored: data");
				}).done();
				return writeFile(ignoreFile, 'dtwo');
			}, DELAY))(delay(function () {
				var invoked = mergeInvoked();
				a.deep(invoked.removed, [], "Ignored revert: removed");
				a.deep(invoked && invoked.added && invoked.added.sort(),
					diff.call(paths, npaths).sort(),
					"Ignored revert: added");
				reader(function (data) {
					a.deep(data.sort(), paths, "Ignored revert: data");
				}).done();
				reader.close();
				return deferred(rmdir(gitPath), unlink(ignoreFile))(false);
			}, DELAY)).done(d, d);
		},
		"Ignored & Type": function (a, d) {
			var gitPath = resolve(pgPath, '.git')
			  , ignoreFile = resolve(pgPath, '.gitignore')
			  , otherName = replaceSep('dtwo/test')
			  , otherPath = resolve(pgPath, otherName)
			  , testName = replaceSep('dthree/fooone')
			  , testPath = resolve(pgPath, testName)
			  , paths = files2.filter(function (path) {
				return path.indexOf('dtwo') === -1;
			})
			  , reader, invoked = [], mergeInvoked;

			mergeInvoked = function () {
				var result;
				if (!invoked.length) {
					return false;
				}
				result = { data: invoked[0].data, removed: [], added: [] };
				invoked.forEach(function (data) {
					push.apply(result.added, data.added);
					push.apply(result.removed, data.removed);
				});
				invoked = [];
				return result;
			};

			paths.push('.gitignore');
			paths.sort();
			deferred(mkdir(gitPath), writeFile(ignoreFile, 'dtwo'))(delay(
				function () {
					reader = t(pgPath, { depth: 2, type: { file: true },
						ignoreRules: 'git', watch: true });
					reader.on('change', function (data) {
						invoked.push(data);
					});
					return reader;
				},
				DELAY
			))(delay(function (data) {
				a.deep(data.sort(), paths);
				return writeFile(otherPath, 'foo');
			}, DELAY))(delay(function () {
				var invoked = mergeInvoked();
				a(invoked, false, "Created other type: event");
				reader(function (data) {
					a.deep(data.sort(), paths, "Created other type: data");
				}).done();
				return unlink(otherPath);
			}, DELAY))(delay(function () {
				var invoked = mergeInvoked();
				a(invoked, false, "Deleted other type: event");
				reader(function (data) {
					a.deep(data.sort(), paths, "Deleted other type: data");
				}).done();
				return writeFile(testPath, 'foo');
			}, DELAY))(delay(function () {
				var invoked = mergeInvoked();
				a.deep(invoked.removed, [], "Created: removed");
				a.deep(invoked.added, [testName], "Created: added");
				reader(function (data) {
					var npaths = aFrom(paths);
					npaths.push(testName);
					a.deep(data.sort(), npaths.sort(), "Created: data");
				}).done();
				return t(pgPath, { depth: 2, type: { file: true },
					ignoreRules: 'git' });
			}, DELAY))(function (data) {
				var npaths = aFrom(paths);
				npaths.push(testName);
				a.deep(data.sort(), npaths.sort(), "Not watched");
				return unlink(testPath);
			})(delay(function () {
				var invoked = mergeInvoked();
				a.deep(invoked.removed, [testName], "Deleted: removed");
				a.deep(invoked.added, [], "Deleted: added");
				reader(function (data) {
					a.deep(data.sort(), paths, "Deleted: data");
				}).done();
			}, DELAY))(delay(function () {
				return writeFile(ignoreFile, 'dtwo\none');
			}, DELAY))(delay(function () {
				var invoked, npaths = paths.filter(function (path) {
					return (path !== 'one') && (path.indexOf(sep + 'one') === -1);
				}).sort();
				invoked = mergeInvoked();
				a.deep(invoked.removed && invoked.removed.sort(),
					diff.call(paths, npaths).sort(), "Ignored: removed");
				a.deep(invoked.added, [], "Ignored: added");
				reader(function (data) {
					a.deep(data.sort(), npaths, "Ignored: data");
				}).done();
				reader.close();
				return deferred(rmdir(gitPath), unlink(ignoreFile))(false);
			}, DELAY)).done(d, d);
		},
		"Ignored & Pattern": function (a, d) {
			var pattern = /done/, gitPath = resolve(pgPath, '.git')
			  , ignoreFile = resolve(pgPath, '.gitignore')
			  , otherName = replaceSep('dtwo/test')
			  , otherPath = resolve(pgPath, otherName)
			  , testName = replaceSep('done/fooone')
			  , testPath = resolve(pgPath, testName)
			  , paths = paths2.filter(function (path) {
				return (path.indexOf('dtwo') === -1) && pattern.test(path);
			})
			  , reader, invoked = [], mergeInvoked;

			mergeInvoked = function () {
				var result;
				if (!invoked.length) {
					return false;
				}
				result = { data: invoked[0].data, removed: [], added: [] };
				invoked.forEach(function (data) {
					push.apply(result.added, data.added);
					push.apply(result.removed, data.removed);
				});
				invoked = [];
				return result;
			};

			deferred(mkdir(gitPath), writeFile(ignoreFile, 'dtwo'))(delay(
				function () {
					reader = t(pgPath, { depth: 2, pattern: pattern,
						ignoreRules: 'git', watch: true });
					reader.on('change', function (data) {
						invoked.push(data);
					});
					return reader;
				},
				DELAY
			))(delay(function (data) {
				a.deep(data.sort(), paths);
				return mkdir(otherPath);
			}, DELAY))(delay(function () {
				var invoked = mergeInvoked();
				a(invoked, false, "Created other type: event");
				reader(function (data) {
					a.deep(data.sort(), paths, "Created other type: data");
				}).done();
				return rmdir(otherPath);
			}, DELAY))(delay(function () {
				var invoked = mergeInvoked();
				a(invoked, false, "Deleted other type: event");
				reader(function (data) {
					a.deep(data.sort(), paths, "Deleted other type: data");
				}).done();
				return mkdir(testPath);
			}, DELAY))(delay(function () {
				var invoked = mergeInvoked();
				a.deep(invoked.removed, [], "Created: removed");
				a.deep(invoked.added, [testName], "Created: added");
				reader(function (data) {
					var npaths = aFrom(paths);
					npaths.push(testName);
					a.deep(data.sort(), npaths.sort(), "Created: data");
				}).done();
				return t(pgPath, { depth: 2, pattern: pattern,
					ignoreRules: 'git' });
			}, DELAY))(function (data) {
				var npaths = aFrom(paths);
				npaths.push(testName);
				a.deep(data.sort(), npaths.sort(), "Not watched");
				return rmdir(testPath);
			})(delay(function () {
				var invoked = mergeInvoked();
				a.deep(invoked.removed, [testName], "Deleted: removed");
				a.deep(invoked.added, [], "Deleted: added");
				reader(function (data) {
					a.deep(data.sort(), paths, "Deleted: data");
				}).done();
			}, DELAY))(delay(function () {
				return writeFile(ignoreFile, 'dtwo\none');
			}, DELAY))(delay(function () {
				var invoked, npaths = paths.filter(function (path) {
					return (path !== 'one') && (path.indexOf(sep + 'one') === -1);
				}).sort();
				invoked = mergeInvoked();
				a.deep(invoked && invoked.removed && invoked.removed.sort(),
					diff.call(paths, npaths).sort(), "Ignored: removed");
				a.deep(invoked.added, [], "Ignored: added");
				reader(function (data) {
					a.deep(data.sort(), npaths, "Ignored: data");
				}).done();
				reader.close();
				return deferred(rmdir(gitPath), unlink(ignoreFile))(false);
			}, DELAY)).done(d, d);
		},
		"Ignored & Pattern & Type": function (a, d) {
			var pattern = /done/, gitPath = resolve(pgPath, '.git')
			  , ignoreFile = resolve(pgPath, '.gitignore')
			  , otherName = replaceSep('dtwo/test')
			  , otherPath = resolve(pgPath, otherName)
			  , testName = replaceSep('done/fooone')
			  , testPath = resolve(pgPath, testName)
			  , paths = files2.filter(function (path) {
				return (path.indexOf('dtwo') === -1) && pattern.test(path);
			})
			  , reader, invoked = [], mergeInvoked;

			mergeInvoked = function () {
				var result;
				if (!invoked.length) {
					return false;
				}
				result = { data: invoked[0].data, removed: [], added: [] };
				invoked.forEach(function (data) {
					push.apply(result.added, data.added);
					push.apply(result.removed, data.removed);
				});
				invoked = [];
				return result;
			};

			deferred(mkdir(gitPath), writeFile(ignoreFile, 'dtwo'))(delay(
				function () {
					reader = t(pgPath, { depth: 2, type: { file: true }, pattern: pattern,
						ignoreRules: 'git', watch: true });
					reader.on('change', function (data) {
						invoked.push(data);
					});
					return reader;
				},
				DELAY
			))(delay(function (data) {
				a.deep(data.sort(), paths);
				return writeFile(otherPath, 'foo');
			}, DELAY))(delay(function () {
				var invoked = mergeInvoked();
				a(invoked, false, "Created other type: event");
				reader(function (data) {
					a.deep(data.sort(), paths, "Created other type: data");
				}).done();
				return unlink(otherPath);
			}, DELAY))(delay(function () {
				var invoked = mergeInvoked();
				a(invoked, false, "Deleted other type: event");
				reader(function (data) {
					a.deep(data.sort(), paths, "Deleted other type: data");
				}).done();
				return writeFile(testPath, 'foo');
			}, DELAY))(delay(function () {
				var invoked = mergeInvoked();
				a.deep(invoked.removed, [], "Created: removed");
				a.deep(invoked.added, [testName], "Created: added");
				reader(function (data) {
					var npaths = aFrom(paths);
					npaths.push(testName);
					a.deep(data.sort(), npaths.sort(), "Created: data");
				}).done();
				return t(pgPath, { depth: 2, type: { file: true },
					pattern: pattern, ignoreRules: 'git' });
			}, DELAY))(function (data) {
				var npaths = aFrom(paths);
				npaths.push(testName);
				a.deep(data.sort(), npaths.sort(), "Not watched");
				return unlink(testPath);
			})(delay(function () {
				var invoked = mergeInvoked();
				a.deep(invoked.removed, [testName], "Deleted: removed");
				a.deep(invoked.added, [], "Deleted: added");
				reader(function (data) {
					a.deep(data.sort(), paths, "Deleted: data");
				}).done();
			}, DELAY))(delay(function () {
				return writeFile(ignoreFile, 'dtwo\none');
			}, DELAY))(delay(function () {
				var invoked, npaths = paths.filter(function (path) {
					return (path !== 'one') && (path.indexOf(sep + 'one') === -1);
				}).sort();
				invoked = mergeInvoked();
				a.deep(invoked && invoked.removed && invoked.removed.sort(),
					diff.call(paths, npaths).sort(), "Ignored: removed");
				a.deep(invoked.added, [], "Ignored: added");
				reader(function (data) {
					a.deep(data.sort(), npaths, "Ignored: data");
				}).done();
				reader.close();
				return deferred(rmdir(gitPath), unlink(ignoreFile))(false);
			}, DELAY)).done(d, d);
		},
		"cb": function (a, d) {
			t(pgPath, function (err, result) {
				if (err) {
					d(err);
					return;
				}
				a.deep(result.sort(),
						['done', 'dthree', 'dtwo', 'one', 'three', 'two']);
				d();
			});
		}
	};
};
