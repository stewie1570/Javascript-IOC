var gulp = require('gulp');
var KarmaServer = require('karma').Server;

gulp.task('tdd', function (done) {
	new KarmaServer({
		configFile: __dirname + '/karma.conf.js'
	}, done).start();
});

gulp.task('default', ['tdd'], function (done) { });