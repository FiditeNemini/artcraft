const path = require("path");
const { getLoader, loaderByName } = require("@craco/craco");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const packages = [];
packages.push(path.join(__dirname, "../components"));

// NB: Either `fakeyou` or `storyteller`
// This build switch controls which HTML template to use.
const website = process.env.WEBSITE || "fakeyou"

console.log(`environment website: ${website}`);

const indexTemplate = website === "fakeyou" ? 
    'public/index_fakeyou.html' :
    'public/index_storyteller.html';

console.log(`index template: ${indexTemplate}`);

module.exports = {
  paths: {
    appHtml: indexTemplate,
  },
  webpack: {
    plugins: {
      remove:  [
        "HtmlWebpackPlugin",
        "InterpolateHtmlPlugin ",
        "InlineChunkHtmlPlugin",
      ],
      add: [
        new HtmlWebpackPlugin({
          template: path.resolve(__dirname, indexTemplate),
          // This is the output filename, which we shouldn't need to change:
          // filename: 'index.html',
        }),
      ],
    },
    configure: (webpackConfig, arg) => {
      const { isFound, match } = getLoader(
        webpackConfig,
        loaderByName("babel-loader")
      );
      if (isFound) {
        const include = Array.isArray(match.loader.include)
          ? match.loader.include
          : [match.loader.include];

        match.loader.include = include.concat(packages);
      }
      return webpackConfig;
    },
  },
};
