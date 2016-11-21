const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const validate = require('webpack-validator');

const parts = require('./webpack/parts');

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

const common = {
  // Entry accepts a path or an object of entries.
  // We'll be using the latter form given it's
  // convenient with more complex configurations.
  entry: {
    app: PATHS.app
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo',
      template: 'app/index.html',
      filename: 'index.html'
    })
  ]
};

var config;

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(
      common,
      parts.clean(PATHS.build),
      parts.setupCSS(PATHS.app),
      parts.ractiveLoader(PATHS.app,path.resolve(__dirname, 'app/index.html')),
      parts.babelLoader(PATHS.app),
      parts.jsonLoader(PATHS.app),
      parts.pngLoader(PATHS.app)
    );
    break;
  default:
    config = merge(
      common,
      {
       devtool: 'eval-source-map'
      },
      parts.setupCSS(PATHS.app),
      parts.devServer({
        // Customize host/port here if needed
        host: process.env.HOST,
        port: process.env.PORT
      }),
      parts.ractiveLoader(PATHS.app,path.resolve(__dirname, 'app/index.html')),
      parts.babelLoader(PATHS.app),
      parts.jsonLoader(PATHS.app),
      parts.pngLoader(PATHS.app)
    );
}

module.exports = validate(config);
