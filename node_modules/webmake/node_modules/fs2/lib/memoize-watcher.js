'use strict';

var noop     = require('es5-ext/function/noop')
  , assign   = require('es5-ext/object/assign')
  , memoize  = require('memoizee')
  , ee       = require('event-emitter')
  , eePipe   = require('event-emitter/pipe')
  , deferred = require('deferred')

  , isPromise = deferred.isPromise;

module.exports = function (fn/*, options*/) {
	var factory, memoized;
	if (fn.__memoized__) return fn;
	memoized = memoize(fn, assign(Object(arguments[1]), { refCounter: true }));
	factory = function () {
		var watcher, emitter, pipe, args, def;
		args = arguments;
		watcher = memoized.apply(this, arguments);
		if (isPromise(watcher)) {
			def = deferred();
			emitter = def.promise;
			def.resolve(watcher);
		} else {
			emitter = ee();
		}
		pipe = eePipe(watcher, emitter);
		emitter.close = function () {
			emitter.close = noop;
			pipe.close();
			if (memoized.deleteRef.apply(this, args)) watcher.close();
		};
		return emitter;
	};
	factory.clear = memoized.delete;
	factory.__memoized__ = true;
	return factory;
};
