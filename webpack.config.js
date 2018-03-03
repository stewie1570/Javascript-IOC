var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: "./src/ioc.js",
    output: {
        path: __dirname,
        filename: "./build/index.js",
        library: 'Ioc',
        libraryTarget: 'umd'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['env']
                }
            }
        ]
    },
    stats: {
        colors: true
    }
};