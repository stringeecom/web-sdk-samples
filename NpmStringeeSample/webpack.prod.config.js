const path = require("path"),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    ESLintPlugin = require("eslint-webpack-plugin");

module.exports = {
    optimization : {
        runtimeChunk : "single"
    },
    mode : "production",

    entry   : "./src/index.js",
    plugins : [
        new HtmlWebpackPlugin({
            title : "Output Management"
        }),
        new ESLintPlugin({})
    ],
    output : {
        filename : "[name].bundle.js",
        path     : path.resolve(__dirname, "dist"),
        clean    : true
    }
};
