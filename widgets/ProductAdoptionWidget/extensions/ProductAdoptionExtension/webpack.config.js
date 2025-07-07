const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: {
      background: './src/background/background.js',
      content: './src/content/content.js',
      popup: './src/popup/popup.js',
      options: './src/options/options.js',
      injected: './src/content/injected.js'
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: '[name].js',
      clean: true
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
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        }
      ]
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: 'manifest.json',
            to: 'manifest.json',
            transform(content) {
              // Add development-specific modifications if needed
              if (!isProduction) {
                const manifest = JSON.parse(content);
                manifest.name += ' (Dev)';
                return JSON.stringify(manifest, null, 2);
              }
              return content;
            }
          },
          {
            from: 'public',
            to: 'public'
          },
          {
            from: 'src/popup/popup.html',
            to: 'src/popup/popup.html'
          },
          {
            from: 'src/popup/popup.css',
            to: 'src/popup/popup.css'
          },
          {
            from: 'src/options/options.html',
            to: 'src/options/options.html'
          },
          {
            from: 'src/options/options.css',
            to: 'src/options/options.css'
          },
          {
            from: 'src/content/content.css',
            to: 'src/content/content.css'
          }
        ]
      }),
      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: '[name].css'
        })
      ] : [])
    ],
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction
            }
          }
        })
      ]
    },
    devtool: isProduction ? false : 'cheap-module-source-map',
    watchOptions: {
      ignored: /node_modules/
    }
  };
};