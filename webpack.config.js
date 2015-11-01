var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: "./src/main.js",
    output: {
        path: __dirname,
        filename: "public/app/bundle.js"
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: "babel-loader" }
        ]
    },
    watch: true,
    plugins: [new webpack.optimize.UglifyJsPlugin()],
    devtool: 'source-map'
};