'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var uidNumber = require('uid-number');
var defaultMode = 511 & (~process.umask()); // 511 = 0777

module.exports = function (user, group) {
	var firstFile = true;
	var finalUid = typeof user === 'number' ? user : null;
	var finalGid = typeof group === 'number' ? group : null;

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		file.stat = file.stat || {};
		file.stat.mode = file.stat.mode || defaultMode;

		var finish = function () {
			file.stat.uid = finalUid != null ? finalUid : file.stat.uid;
			file.stat.gid = finalGid != null ? finalGid : file.stat.gid;
			cb(null, file);
		};

		if (firstFile && typeof user === 'string') {
			uidNumber(user, group, function (err, uid, gid) {
				if (err) {
					cb(new gutil.PluginError('gulp-chmod', err, {fileName: file.path}));
					return;
				}

				finalUid = uid;
				finalGid = gid;

				finish();
			});

			firstFile = false;
			return;
		}

		finish();
	});
};
