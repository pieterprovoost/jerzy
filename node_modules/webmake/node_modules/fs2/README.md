# fs2
## Functions that complement and extend [fs](http://nodejs.org/api/all.html#all_file_system) package

_Originally derived from [node-ext](https://github.com/medikoo/node-ext) package._

## Installation

	$ npm install fs2

## API
### chmod(path, mode[, cb]) _(fs2/chmod)_

Same as [fs.chmod](http://nodejs.org/api/all.html#all_fs_lchmod_path_mode_callback). Returns promise.

Not available on Windows.

### copy(src, dest[, options[, cb]]) _(fs2/copy)_

Copy file, returns promise but accepts as well regular callback.
Eventual options are passed to underlying [fs.createWriteStream](http://nodejs.org/api/all.html#all_fs_createwritestream_path_options)

### descriptorsHandler() _(fs2/descriptors-handler)_

Initializes _EMFILE_ errors prevention.

**To be used only in main modules. Never require it in generic module that may be required in others**  

How it works? If limit of descriptors is reached it holds the calls to native functions and releases them when taken descriptors are freed.

Internally it provides same solution as [fs-graceful](https://github.com/isaacs/node-graceful-fs) module with following differences:

1. Focuses only on file descriptors limit problem
2. Gives access to taken/available descriptors count and allows setting of limit by external module. Thanks to that we can also cover descriptors opened by fs.watch module ([watch](#watchpath) is bound to that module)
3. Covers readdir calls (which also happen to throw _EMFILE_ errors)
4. More bulletproof (I assume) error handling logic

### isIgnored(mode, path[, options[, cb]]) _(fs2/is-ignored)_

Whether file is ignored up to predefined rules. Returns promise but regular callback is also supported.

Rules are decided by _mode_ argument. Currently only `git` mode is supported, in that case rules are searched in _.gitignore_ files (Rules have effect only if placed in valid _git_ repositories).
Other modes can be easily configured by extending `_ignoreModes` module (See _lib/fs/\_ignore-modes_ directory to see how it's done).

Supported options:
* __globalRules__ `string|array` - additional global rules. They will be matched as if placed in filesystem root directory, it means that any rules found in existing ignore files may override them.
* __watch__ `bool` - whether to watch for changes. If ignore state would change, returned promise would emit `change` event with new value (_true_/_false_)

### lchmod(path, mode[, cb]) _(fs2/lchmod)_

Same as [fs.lchmod](http://nodejs.org/api/all.html#all_fs_lchmod_path_mode_callback). Returns promise.

Only available on Mac OS X.

### lstat(path[, cb]) _(fs2/lstat)_

Same as [fs.lstat](http://nodejs.org/api/all.html#all_fs_lstat_path_callback). Returns promise.

### mkdir(path[, options|mode[, cb]]) _(fs2/mkdir)_

Extended version of native _mkdir_. Returns promise

Supported options:
* __mode__ - Reflects _mode_ in [native version](http://nodejs.org/api/all.html#all_fs_mkdir_path_mode_callback)
* __intermediate__ - Whether to create directories recursively (if parent is not created), reflects `mkir -p`, internal implementation inspired by [Substack's node-mkdirp](https://github.com/substack/node-mkdirp/)

### readFile(path[, options][, cb]) _(fs2/read-file)_

Extended version of native [fs.readFile](http://nodejs.org/api/all.html#all_fs_readfile_filename_encoding_callback). Returns promise

Supported options:
* __loose__ - Do not error if file doesn't exits or is inaccessible, return _null_ instead.
* __watch__ - Whether to watch file for changes. Changes are emited via _change_ event on returned promise. If file was removed and _loose_ option is off, _end_ event is emitted and watcher is closed

### readdir(path[, options[, cb]]) _(fs2/readdir)_

Extended version of native [fs.readdir](http://nodejs.org/api/all.html#all_fs_readdir_path_callback). Returns promise

Suported options:
* __depth__ `number`- Level of recurse into subdirectories. Defaults to _0_ which resembles behavior of native version. If you want to recurse without any nest limitation just provide _Infinity_
* __type__ `object`- Which type of files should be returned. By default all files are returned. [Stats methods](http://nodejs.org/api/all.html#all_class_fs_stats) shows how many different types can be returned. To narrow it down provide a hash. e.g. `{ file: true, symbolicLink: true }`.
* __pattern__ `regexp`- Filter returned files by specific pattern. Pattern should be regular expression that would be matched against full path.
* __watch__ `bool` - Watch directory for changes. Changes are emitted on returned promise with `data` events. _event_ object states which files were added (`event.added`) and which were removed (`event.removed`), ___Starting from next release (v0.4) this functionality will most likely be provided as valid Node.js [stream](http://nodejs.org/api/all.html#all_stream)___
* __stream__ `bool` - Whether to provide data continuously. Currently it's not provided as a [stream](http://nodejs.org/api/all.html#all_stream) per se (it would be starting from next release, v0.4), data is emited as `data` events on returned promise object, structure of _event_ objects described under _watch_ option
* __ignoreRules__ `string|array` - Whether to obey ignore rules found in ignore files. See _[fs.isIgnored](#isignoredmode-path-options-cb)_ for more information
* __globalRules__ `string|array` - Global rules that complement ignoreRules. See _[fs.isIgnored](#isignoredmode-path-options-cb)_ for more information.

### rename(oldPath, newPath[, cb]) _(fs2/rename)_

Same as [fs.rename](http://nodejs.org/api/all.html#all_fs_rename_oldpath_newpath_callback). Returns promise.

### rmdir(path[, options[, cb]]) _(fs2/rmdir)_

Extended version of native _rmdir_. Returns promise

Supported options:
* __recursive__ - Attempt to remove directory with subdirectories recursively.
* __force__ - Attempt to remove other files within directory as well.

### stat(path[, cb]) _(fs2/stat)_

Same as [fs.stat](http://nodejs.org/api/all.html#all_fs_stat_path_callback). Returns promise.

### symlink(srcPath, dstPath[, type[, cb]]) _(fs2/symlink)_

Same as [fs.symlink](http://nodejs.org/api/all.html#all_fs_symlink_srcpath_dstpath_type_callback). Returns promise.

### typeByStats(stats) _(fs2/type-by-stats)_

Returns type of file according to provided [stats](http://nodejs.org/api/all.html#all_class_fs_stats) object.

### unlink(path[, cb]) _(fs2/unlink)_

Same as [fs.unlink](http://nodejs.org/api/all.html#all_fs_unlink_path_callback). Returns promise.

### watchPath(path) _(fs2/watch-path)_

Watch specific path for changes. It's about observing specific file path (not directory content). `change` events are emitted with event object where `event.type` says wether file was created, modified or removed.

### watch(path) _(fs2/watch)_

Watch file for changes.  
[fs.watch](http://nodejs.org/api/all.html#all_fs_watch_filename_options_listener) wrapper that works same way on every platform, always configured in _persistent: false_ mode.
It's aware of open file descriptors limitations, if _EMFILE_ error is approach, switch to alternative mode that pings file stats (see [fs.watchFile](http://nodejs.org/api/all.html#all_fs_watchfile_filename_options_listener)) is made.


### writeFile(filename, data[, options|encoding[, callback]]) _(fs2/write-file)_

Same as native [fs.writeFile](http://nodejs.org/api/all.html#all_fs_writefile_filename_data_encoding_callback) but safe for simultaneous calls of write to same file (in such case current write will be abandonded, and new would be started).

Supported options:
* __encoding__ - Reflects _encoding_ in [native version](http://nodejs.org/api/all.html#all_fs_writefile_filename_data_options_callback)
* __intermediate__ - In case directory doesn't exist, whether to create full directory path

## Tests [![Build Status](https://travis-ci.org/medikoo/fs2.png?branch=master)](https://travis-ci.org/medikoo/fs2)

	$ npm test
