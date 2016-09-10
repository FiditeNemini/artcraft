module.exports = {
  entry: {
    testing_app: './testing_app.ts', // TODO: Rename just broke this
    waveform: './waveform.ts',
  },
  output: {
    path: '../web/output',
    filename: '[name].built.js'
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
