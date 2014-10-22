# find-requires – Find all require() calls.

Made for [modules-webmake](https://github.com/medikoo/modules-webmake). Fast and solid implementation of require calls parser. Plain cases are worked out by straightforward code walker, rest of the job is done by fastest in the field [esprima AST parser](http://esprima.org/).

## Example

foo.js:

```javascript
var one = require('one');
var two = require('two');
var slp = require('some/long' +
						'/path');
var wrong = require(cannotTakeThat);
```

program.js:

```javascript
var fs = require('fs');
var findRequires = require('find-requires')

var src = fs.readFileSync('foo.js', 'utf-8');

console.log(findRequires(src)); // => ['one', 'two', 'some/long/path'];

// or we can get more detailed data with `raw` option:
console.log(findRequires(src, { raw: true })); /* => [
	{ value: 'one', raw: '\'one\'', point: 19, line: 1, column: 19 },
	{ value: 'two', raw: '\'two\'', point: 45, line: 2, column: 19 },
	{ value: 'some/long/path', raw: '\'some/long\' +\n\t\t\t\t\t\t\'/path\'',
		point: 71, line: 3, column: 19  },
	{ raw: 'cannotTakeThat', point: 121, line: 5, column: 21 }
] */
````

## CLI Example

```
> npm install -g find-requires
```

Find all requires in a file:
```
> find-requires file1.js
test1.js:3:LIB + '/test2'
test1.js:4:fs
```

Find all places the fs module is required: `find-requires -m fs $(find . -name '*.js')`

## Tests [![Build Status](https://secure.travis-ci.org/medikoo/find-requires.png?branch=master)](https://secure.travis-ci.org/medikoo/find-requires)

	$ npm test
