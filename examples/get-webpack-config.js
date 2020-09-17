const HtmlWebpackPlugin = require('html-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const nodeExternals = require('webpack-node-externals')
const LoadableWebpackPlugin = require('@loadable/webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { join } = require('path')

const webpack = require('webpack')

module.exports = function getConfig(mode) {
  const config = {
    name: mode,
    devtool: false,
    context: __dirname + '/src',
    entry: {},
    output: {},
    node: {
      __dirname: false,
      __filename: false
    },
    resolve: {},
    mode: 'development',
    devServer: {
      historyApiFallback: true,
      contentBase: __dirname + '/dllDist'
    },
    module: {
      rules: [
        {
          test: /\.css?$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: mode !== 'ssr'
              }
            },
            {
              loader: 'css-loader',
              options: {}
            }
          ]
        },
        {
          test: /\.jsx?$/,
          exclude: [/src\/components/],
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/react']
              }
            }
          ]
        },
        {
          test: /\.jsx?$/,
          include: [/src\/components/],
          use: [
            {
              loader: require.resolve('..'),
              options: {
                fallback: '"加载中..."'
              }
            },
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/react'],
                plugins: ['@loadable/babel-plugin']
              }
            }
          ]
        }
      ]
    },
    plugins: [new CleanWebpackPlugin(), new MiniCssExtractPlugin({})]
  }

  if (mode === 'normal-with-dll') {
    config.plugins.push(
      new webpack.DllReferencePlugin({
        manifest: require('./manifest.json')
      })
    )
  }

  if (mode === 'normal' || mode === 'normal-with-dll') {
    config.entry.app = '.'
    config.entry.dll = './dll-entry'

    config.plugins.push(
      new HtmlWebpackPlugin({
        template: './index.ejs'
      }),
      new AddAssetHtmlPlugin({ filepath: __dirname + '/dllDist/dll.js' }),
      new LoadableWebpackPlugin({})
    )
  } else if (mode === 'dll') {
    config.entry.dll = ['./dll-entry']
    config.output.library = '[name]'
    config.output.path = __dirname + '/dllDist'
    config.plugins.push(
      new webpack.DllPlugin({
        name: '[name]',
        path: './manifest.json'
      }),
      new LoadableWebpackPlugin({})
    )
  } else if (mode === 'ssr') {
    config.entry.index = './index-ssr'
    config.output.libraryTarget = 'commonjs2'
    config.output.path = __dirname + '/ssrDist'

    config.target = 'node'
    config.resolve.mainFields = ['main', 'module']
    config.externals = [
      nodeExternals({
        modulesDir: join(__dirname, '../node_modules'),
        allowlist: [/\.css$/]
      })
    ]
    config.plugins.push(new LoadableWebpackPlugin({}))
  }

  return config
}
