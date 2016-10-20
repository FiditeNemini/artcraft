module.exports = {
  entry: {
    testing_app: './old_test_page/testing_app.ts', // TODO: Rename broke this
    waveform_component: './waveform_component.ts',
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
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      }
    ]
  }
}
