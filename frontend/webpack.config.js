module.exports = {
  entry: {
    // Frontend code
    main: './main.ts',

    // Old code
    waveform_component: './waveform_component.ts',
    //testing_app: './old_test_page/testing_app.ts', // TODO: Rename broke this
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
