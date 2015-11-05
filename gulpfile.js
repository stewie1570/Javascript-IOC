var gulp = require('gulp');
var gulpWebpack = require('gulp-webpack');
var webpack = require('webpack');
var clean = require('gulp-clean');
var KarmaServer = require('karma').Server;
var less = require('gulp-less');
var path = require('path');
var watch = require('gulp-watch');
var minifyCss = require('gulp-minify-css');

function build(ops) {
	var webpackConfig = require('./webpack.config.js');

	webpackConfig.devtool = ops.sourceMap ? 'source-map' : undefined;
	webpackConfig.watch = ops.watch;

	return gulp.src('src/ioc.js')
		.pipe(gulpWebpack(webpackConfig))
		.pipe(gulp.dest('./'));
}

gulp.task('less', function () {
	gulp.src('./styles/**/*.less')
		.pipe(watch('styles/**/*.less'))
		.pipe(less({
			paths: [path.join(__dirname, 'less', 'includes')]
		}))
		.pipe(minifyCss())
		.pipe(gulp.dest('./public/css'));
});

gulp.task('clean', function () {
	return gulp.src('public/app/**', { read: false }).pipe(clean());
});

gulp.task('tdd', function (done) {
	new KarmaServer({
		configFile: __dirname + '/karma.conf.js'
	}, done).start();
});

gulp.task('default', ['tdd'], function (done) { });

gulp.task('build-dev', ['clean', 'less'], function () {
	return build({
		sourceMap: true,
		watch: true
	});
});

gulp.task('build-prod', ['clean', 'less'], function () {
	return build({
		sourceMap: false,
		watch: false
	});
});