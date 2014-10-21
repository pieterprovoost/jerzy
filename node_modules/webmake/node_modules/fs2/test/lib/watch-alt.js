'use strict';

var fs        = require('fs')
  , resolve   = require('path').resolve
  , deferred  = require('deferred')
  , delay     = deferred.delay
  , promisify = deferred.promisify
  , mkdir     = promisify(fs.mkdir)
  , open      = promisify(fs.open)
  , rename    = promisify(fs.rename)
  , write     = promisify(fs.write)
  , close     = promisify(fs.close)
  , writeFile = promisify(fs.writeFile)
  , unlink    = promisify(fs.unlink)
  , rmdir     = promisify(fs.rmdir)

  , pgPath = resolve(__dirname, '../__playground/lib/watch-alt');

module.exports = function (t, a, d) {
	var ondirchange = 0, onfilechange = 0, ondirend = 0, onfileend = 0
	  , DELAY = 200, DELAYWAIT = 2000
	  , dirPath = resolve(pgPath, 'tmpdir')
	  , filePath = resolve(dirPath, 'tmpfile');

	a.throws(function () {
		t(filePath);
	}, "Not existing");

	delay(function () {
		return mkdir(dirPath);
	}, DELAY)()(delay(function () {
		var dirWatch;
		dirWatch = t(dirPath);
		dirWatch.on('change', function () { ++ondirchange; });
		dirWatch.on('end', function () { ++ondirend; });
	}, DELAY))(delay(function () {
		return writeFile(filePath, 'raz');
	}, DELAYWAIT))(delay(function () {
		var fileWatch;
		a(ondirchange, 1, "Dir change: File created");
		a(ondirend, 0, "Dir end: File created");
		ondirchange = ondirend = 0;
		fileWatch = t(filePath);
		fileWatch.on('change', function () { ++onfilechange; });
		fileWatch.on('end', function () { ++onfileend; });
	}, DELAYWAIT))(delay(function () {
		return open(filePath, 'a')(function (fd) {
			return write(fd, new Buffer('dwatrzy'), 0, 3, null)(function () {
				return close(fd);
			});
		});
	}, DELAY))(delay(function () {
		a(ondirchange, 0, "Dir change: File changed");
		a(ondirend, 0, "Dir end: File changed");
		a(onfilechange, 1, "File change: File created");
		a(onfileend, 0, "File end: File created");
		ondirchange = ondirend = onfilechange = onfileend = 0;
		return rename(filePath, filePath + 'r');
	}, DELAYWAIT))(delay(function () {
		a(ondirchange, 1, "Dir change: File renamed");
		a(ondirend, 0, "Dir end: File renamed");
		a(onfilechange, 0, "File change: File renamed");
		a(onfileend, 1, "File end: File renamed");
		ondirchange = ondirend = onfilechange = onfileend = 0;
		return rename(filePath + 'r', filePath);
	}, DELAYWAIT))(delay(function () {
		a(ondirchange, 1, "Dir change: File renamed back");
		a(ondirend, 0, "Dir end: File renamed back");
		a(onfilechange, 0, "File change: File renamed back");
		a(onfileend, 0, "File end: File renamed back");
		ondirchange = ondirend = onfilechange = onfileend = 0;
		return unlink(filePath);
	}, DELAYWAIT))(delay(function () {
		a(ondirchange, 1, "Dir change: File removed");
		a(ondirend, 0, "Dir end: File removed");
		a(onfilechange, 0, "File change: File removed");
		a(onfileend, 0, "File end: File removed");
		ondirchange = ondirend = onfilechange = onfileend = 0;
		return rmdir(dirPath);
	}, DELAYWAIT))(delay(function () {
		a(ondirchange, 0, "Dir change: Dir removed");
		a(ondirend, 1, "Dir end: Dir removed");
		a(onfilechange, 0, "File change: Dir removed");
		a(onfileend, 0, "File end: Dir removed");
	}, DELAYWAIT)).done(d, d);
};
