const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'product-adoption-widget.min.js' : 'product-adoption-widget.js',
      library: 'ProductAdoptionWidget',
      libraryTarget: 'umd',
      libraryExport: 'default',
      globalObject: 'typeof self !== \'undefined\' ? self : this'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction
            },
            format: {
              comments: false
            }
          },
          extractComments: false
        })
      ]
    },
    devtool: isProduction ? false : 'source-map'
  };
};