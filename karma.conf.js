var path = require('path');

module.exports = function (config) {
	config.set({
		browsers: ['PhantomJS'],
		// browsers: ['Chrome'],
		frameworks: ['mocha', 'chai', 'chai-sinon'],
		files: [
			'test/**/*.js',
			'node_modules/babel-polyfill/dist/polyfill.js'
		],

		preprocessors: {
			'src/**/*.js': ['webpack', 'coverage'],
			'test/**/*.js': ['webpack'],
		},

		coverageReporter: {
			reporters: [
				{ type: 'text-summary', dir: 'coverage/' },
				{ type: 'html', dir: 'coverage/', subdir: 'report-html' }
			]
		},

		webpack: {
			resolve: {
				extensions: ["", ".js"]
			},
			module: {
				preLoaders: [
					{
						test: /\.js$/,
						exclude: path.resolve('test/'),
						loader: 'isparta'
					}
				],
				loaders: [
					{ test: /\.js$/, loader: "babel-loader" }
				]
			}
		},


		webpackMiddleware: {
			stats: {
				colors: true
			}
		},


		// test results reporter to use
		// possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
		reporters: ['spec', 'coverage'],


		// web server port
		port: 9876,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,


		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 60000,


		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: false,


		// List plugins explicitly, since autoloading karma-webpack
		// won't work here
		plugins: [
			require("karma-mocha"),
			require("karma-spec-reporter"),
			// require("karma-chrome-launcher"),
			require("karma-phantomjs-launcher"),
			require("karma-webpack"),
			require("karma-chai"),
			require("karma-chai-sinon"),
			require("karma-coverage")
		]
	});
};