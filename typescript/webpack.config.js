module.exports = {
  entry: './testing_app.ts',
  output: {
    path: '../web/output',
    filename: 'testing.js'
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  }
}
