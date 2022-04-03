var webpack = require('webpack');

var plugins = [];

var minify = JSON.parse(process.env.MINIFY || '0');
if (minify) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false }
  }));
}

module.exports = {
  entry: {
    // Frontend code
    main: './main.ts',
    // Old code
    waveform_component: './waveform_component.ts',
    //testing_app: './old_test_page/testing_app.ts', // TODO: Rename broke this
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  output: {
    path: '../web/output',
    filename: '[name].built.js'
  },
  module: {
    loaders: [
      {
        loader: 'ts-loader',
        test: /\.ts$/
      }
    ]
  },
  plugins: plugins,
}
