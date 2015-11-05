var gulp = require('gulp');
var KarmaServer = require('karma').Server;
var gutil = require('gulp-util');
var path = require('path');
var karma = require('karma');
var karmaParseConfig = require('karma/lib/config').parseConfig;

gulp.task('tdd', function (done) {
	new KarmaServer({
		configFile: __dirname + '/karma.conf.js'
	}, done).start();
});

function runKarma(configFilePath, options, cb) {

	configFilePath = path.resolve(configFilePath);

	var server = karma.server;
	var log=gutil.log, colors=gutil.colors;
	var config = karmaParseConfig(configFilePath, {});

    Object.keys(options).forEach(function(key) {
      config[key] = options[key];
    });

	server.start(config, function(exitCode) {
		log('Karma has exited with ' + colors.red(exitCode));
		cb();
		process.exit(exitCode);
	});
}

gulp.task('test', function(done) {
	runKarma('karma.conf.js', {
		autoWatch: false,
		singleRun: true
	}, done);
});

gulp.task('default', ['tdd'], function (done) { });