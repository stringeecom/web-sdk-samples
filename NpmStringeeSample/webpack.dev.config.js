const path              = require("path"),
    HtmlWebpackPlugin   = require("html-webpack-plugin"),
    ESLintPlugin        = require("eslint-webpack-plugin");

module.exports = {
    context      : path.resolve(__dirname),
    devtool      : "inline-source-map",
    // devServer : {
    //     static : path.resolve(__dirname, "/dist")
    // },
    optimization : {
        runtimeChunk : "single"
    },
    mode  : "development",
    entry : {
        voice_call : "./src/voice_call/script.js",
        video_call : "./src/video_call/script.js"
    },
    resolve : {
        alias : {
            "@" : path.resolve(__dirname, "src")
        }
    },
    plugins : [
        new HtmlWebpackPlugin({
            inject     : true,
            publicPath : "/",
            title      : "Index",
            template   : "./src/index.html",
            filename   : "index.html",
            chunks     : []
        }),
        new HtmlWebpackPlugin({
            inject     : "body",
            publicPath : "/",
            title      : "Voice Call",
            template   : "./src/voice_call/index.html",
            filename   : "voice_call.html",
            chunks     : ["voice_call"]
        }),
        new HtmlWebpackPlugin({
            inject     : "body",
            publicPath : "/",
            title      : "Video Call",
            template   : "./src/video_call/index.html",
            filename   : "video_call.html",
            chunks     : ["video_call"]
        }),
        new ESLintPlugin({})
    ],
    output : {
        filename   : "[name].bundle.js",
        path       : path.resolve(__dirname, "dist"),
        clean      : true,
        publicPath : "/"
    }
};
