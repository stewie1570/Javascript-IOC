var gulp = require('gulp');
var KarmaServer = require('karma').Server;
var gutil = require('gulp-util');
var path = require('path');
var karma = require('karma');
var karmaParseConfig = require('karma/lib/config').parseConfig;
var clean = require('gulp-clean');
var gulpWebpack = require('gulp-webpack');

gulp.task('tdd', function (done) {
	new KarmaServer({
		configFile: __dirname + '/karma.conf.js'
	}, done).start();
});

function build(ops) {
	var webpackConfig = require('./webpack.config.js');

	webpackConfig.devtool = ops.sourceMap ? 'source-map' : undefined;
	webpackConfig.watch = ops.watch;

	return gulp.src('src/main.js')
		.pipe(gulpWebpack(webpackConfig))
		.pipe(gulp.dest('./lib'));
}

gulp.task('test', function(done) {
	new KarmaServer({
		configFile: __dirname + '/karma.conf.js',
		singleRun: true
	}, done).start();
});

gulp.task('clean', function () {
	return gulp.src('lib/**', { read: false }).pipe(clean());
});

gulp.task('build-prod', ['clean', 'test'], function () {
	return build({
		sourceMap: false,
		watch: false
	});
});

gulp.task('default', ['tdd'], function (done) { });