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

  , pgPath = resolve(__dirname, './__playground/watch');

module.exports = function (t, a, d) {
	var ondirchange = 0, onfilechange = 0, ondirend = 0, onfileend = 0
	  , w1, w2, w3, w4
	  , DELAY = 100
	  , dirPath = resolve(pgPath, 'tmpdir')
	  , filePath = resolve(dirPath, 'tmpfile');

	a.throws(function () {
		t(filePath);
	}, "Not existing");

	delay(function () {
		return mkdir(dirPath);
	}, DELAY)()(delay(function () {
		w1 = t(dirPath);
		w1.on('change', function () { ++ondirchange; });
		w2 = t(dirPath);
		w2.on('end', function () { ++ondirend; });
	}, DELAY))(delay(function () {
		return writeFile(filePath, 'raz');
	}, DELAY))(delay(function () {
		a(ondirchange, 1, "Dir change: File created");
		a(ondirend, 0, "Dir end: File created");
		ondirchange = ondirend = 0;
		w3 = t(filePath);
		w3.on('change', function () { ++onfilechange; });
		w4 = t(filePath);
		w4.on('end', function () { ++onfileend; });
	}, DELAY))(delay(function () {
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
	}, DELAY))(delay(function () {
		a(ondirchange, 1, "Dir change: File renamed");
		a(ondirend, 0, "Dir end: File renamed");
		a(onfilechange, 0, "File change: File renamed");
		a(onfileend, 1, "File end: File renamed");
		ondirchange = ondirend = onfilechange = onfileend = 0;
		return rename(filePath + 'r', filePath);
	}, DELAY))(delay(function () {
		a(ondirchange, 1, "Dir change: File renamed back");
		a(ondirend, 0, "Dir end: File renamed back");
		a(onfilechange, 0, "File change: File renamed back");
		a(onfileend, 0, "File end: File renamed back");
		ondirchange = ondirend = onfilechange = onfileend = 0;
		return unlink(filePath);
	}, DELAY))(delay(function () {
		a(ondirchange, 1, "Dir change: File removed");
		a(ondirend, 0, "Dir end: File removed");
		a(onfilechange, 0, "File change: File removed");
		a(onfileend, 0, "File end: File removed");
		ondirchange = ondirend = onfilechange = onfileend = 0;
		return rmdir(dirPath);
	}, DELAY))(delay(function () {
		a(ondirchange, 0, "Dir change: Dir removed");
		a(ondirend, 1, "Dir end: Dir removed");
		a(onfilechange, 0, "File change: Dir removed");
		a(onfileend, 0, "File end: Dir removed");
		w1.close();
		w2.close();
		w3.close();
		w4.close();
	}, DELAY)).done(d, d);
};
