var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: "./src/ioc.js",
    output: {
        path: __dirname,
        filename: "index.js"
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: "babel-loader" }
        ]
    },
    watch: true,
    devtool: 'source-map'
};