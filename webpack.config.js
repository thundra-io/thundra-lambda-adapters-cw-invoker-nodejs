const webpack = require("webpack");
const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  target: "node",
  externals: {
    'aws-sdk' : 'aws-sdk'
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "./index.js",
    libraryTarget: "commonjs2",
    library: "thundra"
  },
  resolve: {
    modules: ["node_modules"],
    extensions: [".js", ".jsx"]
  },
  plugins: [
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
        }
      },
      sourceMap: true,
      parallel: true
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
}
