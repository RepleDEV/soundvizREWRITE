/* eslint-disable */

const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");

const rootPath = path.resolve(__dirname);
const outputPath = path.join(rootPath, "./dist/app/");

module.exports = (env) => {
    env = env || {};
    return {
        entry: path.join(rootPath, "./src/app/index.ts"),
        output: {
            filename: "index.js",
            path: outputPath,
        },
        resolve: {
            extensions: [".ts", ".js"],
            mainFields: ["main", "module", "browser"],
        },
        target: "electron-renderer",
        devtool: "source-map",
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: ["style-loader", "css-loader", "sass-loader"],
                },
                {
                    test: /\.ts$/,
                    use: ["ts-loader"],
                },
            ],
        },
        devServer: {
            contentBase: outputPath,
            compress: true,
            hot: true,
            port: env.PORT || 9102,
            publicPath: "/",
        },
        plugins: [
            new HTMLWebpackPlugin({
                filename: "index.html",
                template: "res/index.html",
                inject: true,
                cache: true,
            }),
        ],
    };
};
