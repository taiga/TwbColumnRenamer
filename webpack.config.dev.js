const path = require('path');
const webpack = require('webpack');
module.exports = {
  entry: './src/app.ts',
  output: {
    path: path.resolve(__dirname + '/dist'),
    filename: '[name].js',
    publicPath: '/'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      names: ['common'],
      minChunks: Infinity
    })
  ],
  module: {
    rules: [
      { test: /\.tsx?$/, use: [{loader: 'ts-loader'}]},
      { test: /\.css$/, loaders: 'style-loader!css-loader' },
      { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'file-loader!url-loader?limit=100000' }
    ]
  }
};
