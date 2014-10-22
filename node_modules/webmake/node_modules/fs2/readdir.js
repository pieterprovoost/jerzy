'use strict';

var invoke         = require('es5-ext/function/invoke')
  , noop           = require('es5-ext/function/noop')
  , curry          = require('es5-ext/function/#/curry')
  , contains       = curry.call(require('es5-ext/array/#/contains'))
  , diff           = require('es5-ext/array/#/diff')
  , remove         = require('es5-ext/array/#/remove')
  , assign         = require('es5-ext/object/assign')
  , forEach        = require('es5-ext/object/for-each')
  , isCallable     = require('es5-ext/object/is-callable')
  , isCopy         = require('es5-ext/object/is-copy')
  , toPosInt       = require('es5-ext/number/to-pos-integer')
  , startsWith     = require('es5-ext/string/#/starts-with')
  , deferred       = require('deferred')
  , fs             = require('fs')
  , path           = require('path')
  , typeByStats    = require('./type-by-stats')
  , watchPath      = require('./watch')
  , isIgnored      = require('./is-ignored')

  , isArray = Array.isArray, push = Array.prototype.push
  , promisify = deferred.promisify
  , resolve = path.resolve, sep = path.sep
  , original = fs.readdir, lstat = fs.lstat, pLstat = promisify(lstat)
  , getIsIgnored = isIgnored.getIsIgnored
  , applyGlobalRules = isIgnored.applyGlobalRules

  , Readdir, readdir, enoentSurpass
  , eolRe = /(?:\r\n|[\n\r\u2028\u2029])/
  , passErrCodes = ['ENOENT', 'DIFFTYPE'];

passErrCodes.contains = contains;
enoentSurpass = function (err) {
	return passErrCodes.contains(err.code) ? [] : err;
};

Readdir = function () {};
Readdir.prototype = {
	init: function () {
		var data, result, promise, stream;
		stream = this.stream;
		data = this.read(this.path, this.depth);
		if (!this.depth) {
			promise = data.files;
			if (this.stream) {
				promise.aside(function (files) {
					promise.emit('change', { data: files, added: files, removed: [] });
				});
			}
			return promise;
		}
		this.readers = {};
		result = [];
		assign(this, deferred());
		promise = this.promise;

		data.files.done(null, this.reject);
		if (this.watch) {
			data.files.on('end', function () {
				delete this.readers;
				if (!promise.resolved) {
					this.reject(new Error("Directory was removed"));
					return;
				}
				promise.emit('end', result);
			}.bind(this));
			promise.close = this.close.bind(this);
		}

		(function self(data, root, depth) {
			var getPath, files;
			this.readers[root] = { files: data.files };
			if (data.dirs && (data.dirs !== data.files)) {
				this.readers[root].dirs = data.dirs;
			}
			if (root) {
				getPath = function (path) { return root + path; };
				files = data.files.aside(function (files) {
					if (files.length) {
						files = files.map(getPath);
						push.apply(result, files);
						if (promise.resolved || stream) {
							promise.emit('change',
								{ data: result, removed: [], added: files });
						}
					}
					return files;
				});
			} else {
				files = data.files.aside(function (files) {
					if (files.length) {
						push.apply(result, files);
						if (promise.resolved || stream) {
							promise.emit('change',
								{ data: result, removed: [], added: files });
						}
					}
					return files;
				});
			}
			if (this.watch) {
				if (root) {
					data.files.on('end', data.files.onend = function (files) {
						delete this.readers[root];
						if (files.length) {
							files = files.map(getPath);
							remove.apply(result, files);
							if (promise.resolved || stream) {
								promise.emit('change',
									{ data: result, removed: files, added: [] });
							}
						}
					}.bind(this));
				}
				data.files.on('change', function (data) {
					var removed, added;
					removed = root ? data.removed.map(getPath) : data.removed;
					added = root ? data.added.map(getPath) : data.added;
					remove.apply(result, removed);
					push.apply(result, added);
					if (promise.resolved || stream) {
						promise.emit('change',
							{ data: result, removed: removed, added: added });
					}
				});
			}

			if (data.dirs) {
				if (this.watch) {
					data.dirs.on('change', function (data) {
						deferred.map(data.added, function (dir) {
							return self.call(this,
								this.read(this.path + sep + root + dir, depth - 1),
								root + dir + sep, depth - 1);
						}, this).done();
						data.removed.forEach(function self(dir) {
							var path = root + dir + sep
							  , reader = this.readers[path];
							if (reader) {
								reader.files.close();
								if (reader.dirs) reader.dirs.close();
								reader.files.onend(reader.files.value);
								forEach(this.readers, function self(reader, key) {
									if (startsWith.call(key, path)) {
										reader.files.close();
										if (reader.dirs) reader.dirs.close();
										reader.files.onend(reader.files.value);
									}
								});
							}
						}.bind(this));
					}.bind(this));
				}
				return deferred(files(null, enoentSurpass),
					data.dirs(null, enoentSurpass).map(function (dir) {
						return self.call(this,
							this.read(this.path + sep + root + dir, depth - 1),
							root + dir + sep, depth - 1);
					}, this));
			}
			return files;
		}.call(this, data, '', this.depth))
			.done(this.resolve.bind(this, result), this.reject);

		return this.promise;
	},
	close: function () {
		if (this.readers) {
			forEach(this.readers, function (data) {
				data.files.close();
				if (data.dirs) data.dirs.close();
			});
			delete this.readers;
		}
	},
	read: function (path, getDirs) {
		var dirPaths, paths, data;

		paths = this.readdir(path);

		if (this.type || getDirs) {
			data = this.filterByType(paths, getDirs);
			paths = data.files;
			dirPaths = data.dirs;
		} else if (this.pattern || this.globalRules) {
			paths = this.filterByPattern(paths);
		}
		if (this.isIgnored) {
			if (dirPaths && (dirPaths !== paths)) {
				dirPaths = this.filterIgnored(dirPaths);
				paths = this.filterIgnored(paths);
			} else {
				paths = this.filterIgnored(paths);
				if (dirPaths) dirPaths = paths;
			}
		}

		return { files: paths, dirs: dirPaths };
	},
	filterByType: function (paths, getDirs) {
		var result = {}, test, root = paths.root
		  , files, dirs, resolve, defFiles, defDirs, close, resolved, failed;

		if (this.type || this.pattern || this.globalRules) {
			files = [];
			defFiles = deferred();
			result.files = defFiles.promise;
			result.files.root = root;
		} else {
			result.files = paths;
		}
		if (getDirs) {
			if (this.type && isCopy(this.type, { directory: true }) &&
					!this.pattern) {
				dirs = files;
				result.dirs = result.files;
				getDirs = false;
			} else {
				dirs = [];
				defDirs = deferred();
				result.dirs = defDirs.promise;
				result.dirs.root = root;
			}
		}

		resolve = function (e) {
			if (defFiles) {
				if (e) defFiles.reject(e);
				else defFiles.resolve(files);
			}
			if (defDirs) {
				if (e) defDirs.reject(e);
				else defDirs.resolve(dirs);
			}
			failed = Boolean(e);
			resolved = true;
		};

		paths.done(function (paths) {
			var waiting = paths.length;
			if (!waiting) {
				resolve();
				return;
			}
			paths.forEach(function (path) {
				var fullPath = root + sep + path;
				if ((!getDirs && this.pattern && !this.pattern.test(fullPath)) ||
						(this.globalRules &&
							applyGlobalRules(fullPath, this.globalRules))) {
					if (!--waiting) resolve();
					return;
				}
				lstat(fullPath, function (err, stat) {
					var type;
					if (resolved) return;
					if (!err) {
						try {
							type = typeByStats(stat);
						} catch (e) {
							resolve(e);
							return;
						}
						if (files && (!this.type || this.type[type]) &&
								(!this.pattern || !getDirs || this.pattern.test(fullPath))) {
							files.push(path);
						}
						if (getDirs && (type === 'directory')) dirs.push(path);
					} else if (err.code !== 'ENOENT') {
						resolve(err);
						return;
					}
					if (!--waiting) resolve();
				}.bind(this));
			}, this);
		}.bind(this), resolve);

		if (this.watch) {
			test = function (path, files, dirs) {
				var fullPath = root + sep + path, promise;
				if ((!getDirs && this.pattern && !this.pattern.test(fullPath)) ||
						(this.globalRules &&
							applyGlobalRules(fullPath, this.globalRules))) {
					return null;
				}
				promise = pLstat(fullPath).aside(function (stat) {
					var type = typeByStats(stat);
					if (files && (!this.type || this.type[type]) &&
							(!this.pattern || !getDirs || this.pattern.test(fullPath))) {
						files.push(path);
					}
					if (dirs && (type === 'directory')) dirs.push(path);
				}.bind(this));
				return promise.catch(function (err) {
					if (err.code !== 'ENOENT') throw err;
				});
			}.bind(this);

			paths.on('change', function (data) {
				var removed, nFiles, nDirs;
				if (data.added.length) {
					nFiles = files && [];
					nDirs = getDirs && [];
				}
				deferred.map(data.added, function (path) {
					return test(path, nFiles, nDirs);
				}).done(function () {
					if (files) {
						removed = data.removed.filter(contains, files);
						if (removed.length || (nFiles && nFiles.length)) {
							remove.apply(files, removed);
							if (nFiles) push.apply(files, nFiles);
							result.files.emit('change',
								{ data: files, removed: removed, added: nFiles || [] });
						}
					}
					if (getDirs) {
						removed = data.removed.filter(contains, dirs);
						if (removed.length || (nDirs && nDirs.length)) {
							remove.apply(dirs, removed);
							if (nDirs) push.apply(dirs, nDirs);
							result.dirs.emit('change',
								{ data: dirs, removed: removed, added: nDirs || [] });
						}
					}
				});
			});

			paths.on('end', function (data, err) {
				if (!resolved) {
					if (defFiles) defFiles.reject(err);
					if (defDirs) defDirs.reject(err);
					return;
				}
				if (!failed) {
					if (files) result.files.emit('end', files, err);
					if (getDirs) result.dirs.emit('end', dirs, err);
				}
			});

			close = function () {
				if (defFiles && !defFiles.resolved) {
					defFiles.reject(new Error("Readdir operation cancelled"));
				}
				if (defDirs && !defDirs.resolved) {
					defDirs.reject(new Error("Readdir operation cancelled"));
				}
				paths.close();
			};

			if (defFiles) {
				result.files.close = close;
				if (defDirs) result.dirs.close = noop;
			} else {
				result.dirs.close = close;
			}
		}
		return result;
	},
	filterByPattern: function (paths) {
		var promise, result, root = paths.root, pattern = this.pattern
		  , rules = this.globalRules, filter;

		filter = function (path) {
			var fullPath = root + sep + path;
			return ((!pattern || pattern.test(fullPath)) &&
				(!rules || !applyGlobalRules(fullPath, rules)));
		};

		promise = paths(function (data) {
			return (result = data.filter(filter));
		});
		promise.root = root;
		if (this.watch) {
			paths.on('change', function (data) {
				var removed, added;
				removed = data.removed.filter(contains, result);
				added = data.added.filter(filter);
				if (removed.length || added.length) {
					remove.apply(result, removed);
					push.apply(result, added);
					promise.emit('change',
						{ data: result, removed: removed, added: added });
				}
			});
			paths.on('end', function (data, err) {
				promise.emit('end', result, err);
			});
			promise.close = function () { paths.close(); };
		}
		return promise;
	},
	filterIgnored: function (paths) {
		var promise, result, test, root = paths.root, promises, def = deferred();

		promise = def.promise;
		test = function (path, cb) {
			var status = this.isIgnored(root + sep + path);
			if (this.watch) {
				promises[path] = status;
				status.on('change', function (value) {
					if (value) {
						remove.call(result, path);
						promise.emit('change',
							{ data: result, removed: [path], added: [] });
					} else {
						result.push(path);
						promise.emit('change',
							{ data: result, removed: [], added: [path] });
					}
				});
			}
			status.aside(cb);
		}.bind(this);

		if (this.watch) {
			promises = {};

			paths.on('change', function (data) {
				var removed, added = [], waiting = data.added.length, onEnd;
				data.removed.forEach(function (path) {
					promises[path].close();
					delete promises[path];
				});
				removed = data.removed.filter(contains, result);
				onEnd = function () {
					if (removed.length || added.length) {
						remove.apply(result, removed);
						push.apply(result, added);
						promise.emit('change',
							{ data: result, removed: removed, added: added });
					}
				};
				if (!waiting) {
					onEnd();
					return;
				}
				data.added.forEach(function (path) {
					test(path, function (isIgnored) {
						if (!isIgnored) added.push(path);
						if (!--waiting) onEnd();
					});
				});
			});

			paths.on('end', function (data, err) {
				forEach(promises, invoke('close'));
				promises = null;
				if (!def.resolved) {
					def.reject(err);
					return;
				}
				promise.emit('end', result, err);
			});

			promise.close = function () {
				if (promises) {
					if (!def.resolved) def.reject(new Error("Operation aborted"));
					forEach(promises, invoke('close'));
					promises = null;
					paths.close();
				}
			};
		}

		paths.done(function (paths) {
			var waiting = paths.length;
			result = [];
			if (!waiting) {
				def.resolve(result);
				return;
			}
			paths.forEach(function (path) {
				test(path, function (isIgnored) {
					if (!isIgnored) result.push(path);
					if (!--waiting) def.resolve(result);
				});
			});
		}, function (e) { def.reject(e); });
		promise.root = root;
		return promise;
	},
	readdir: function (path) {
		var def, promise, watcher, files;
		def = deferred();
		promise = def.promise;
		promise.root = path;
		if (this.watch) {
			try {
				watcher = watchPath(path);
			} catch (e) {
				return def.reject(e);
			}
			watcher.on('end', function (err) {
				if (!def.resolved) def.reject(err);
				else if (files) promise.emit('end', files, err);
			});
			watcher.on('change', function () {
				original(path, function (err, data) {
					var removed, added;
					if (err) {
						promise.emit('end', files, err);
						return;
					}
					removed = diff.call(files, data);
					added = diff.call(data, files);
					if (removed.length || added.length) {
						remove.apply(files, removed);
						push.apply(files, added);
						promise.emit('change',
							{ data: files, removed: removed, added: added });
					}
				});
			});
			promise.close = function () {
				watcher.close();
				if (!def.resolved) def.reject(new Error("Readdir action cancelled"));
			};
		}
		original(path, function (err, data) {
			if (err) {
				def.reject(err);
				return;
			}
			def.resolve(files = data);
		}.bind(this));
		return promise;
	}
};

readdir = function (path, options) {
	var readdir, globalRules;

	readdir = new Readdir();
	readdir.path = path;
	readdir.depth = isNaN(options.depth) ? 0 : toPosInt(options.depth);
	readdir.type = (options.type != null) ? Object(options.type) : null;
	readdir.pattern = (options.pattern != null) ?
			new RegExp(options.pattern) : null;
	readdir.watch = options.watch;
	readdir.stream = Boolean(options.stream);

	if (options.globalRules) {
		globalRules = isArray(options.globalRules) ? options.globalRules :
				String(options.globalRules).split(eolRe);
	}
	if (options.ignoreRules) {
		assign(readdir, getIsIgnored(isArray(options.ignoreRules) ?
				options.ignoreRules : [options.ignoreRules], globalRules,
			options.watch));
	} else {
		readdir.globalRules = globalRules;
	}

	return readdir.init();
};
readdir.returnsPromise = true;

module.exports = exports = function (path) {
	var options, cb;
	path = resolve(String(path));
	options = Object(arguments[1]);
	cb = arguments[2];
	if ((cb == null) && isCallable(options)) {
		cb = options;
		options = {};
	}

	return readdir(path, options).cb(cb);
};
exports.returnsPromise = true;
exports.readdir = readdir;
