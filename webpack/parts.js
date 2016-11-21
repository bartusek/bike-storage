const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

exports.devServer = function(options) {
  return {
    devServer: {
      // Enable history API fallback so HTML5 History API based
      // routing works. This is a good default that will come
      // in handy in more complicated setups.
      historyApiFallback: true,

      // Unlike the cli flag, this doesn't set
      // HotModuleReplacementPlugin!
      hot: true,
      inline: true,

      // Display only errors to reduce the amount of output.
      stats: 'errors-only',

      // Parse host and port from env to allow customization.
      //
      // If you use Vagrant or Cloud9, set
      // host: options.host || '0.0.0.0';
      //
      // 0.0.0.0 is available to all network devices
      // unlike default `localhost`.
      host: options.host, // Defaults to `localhost`
      port: options.port // Defaults to 8080
    },
    plugins: [
      // Enable multi-pass compilation for enhanced performance
      // in larger projects. Good default.
      new webpack.HotModuleReplacementPlugin({
        multiStep: true
      })
    ]
  };
}

exports.setupCSS = function(paths) {
  return {
    module: {
      loaders: [
        {
          test: /\.css$/,
          loaders: ['style', 'css'],

        }
      ]
    }
  };
}

exports.clean = function(path) {
  return {
    plugins: [
      new CleanWebpackPlugin([path], {
        // Without `root` CleanWebpackPlugin won't point to our
        // project and will fail to work.
        root: process.cwd()
      })
    ]
  };
}

exports.ractiveLoader = function(paths,excludePath) {
  return {
    module: {
      loaders: [
        {
          test: /\.html$/,
          loader: 'ractive',
          exclude: excludePath,
          include: paths
        }
      ]
    }
  };
}

exports.babelLoader = function(paths) {
  return {
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude:  /node_modules\/(?!wayfarer)/,
          loader: 'babel', // 'babel-loader' is also a valid name to reference
          query: {
            presets: ['es2015']
          }
        }
      ]
    }
  };
}

exports.jsonLoader = function(paths) {
  return {
    module: {
      loaders: [
        {
          test: /\.json$/,
          loader: 'json',
          include: paths
        }
      ]
    }
  };
}

exports.pngLoader = function(paths) {
  return {
    module: {
      loaders: [
        {
          test: /\.png$/,
          loader: "url-loader",
          query: { mimetype: "image/png" }
        }
      ]
    }
  };
}
