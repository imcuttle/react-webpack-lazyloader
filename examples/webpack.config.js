const HtmlWebpackPlugin = require('html-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')

const webpack = require('webpack')

const mode = process.env.BUILD_MODE || 'normal-with-dll'

const config = {
  context: __dirname + '/src',
  entry: {},
  output: {},
  mode: 'development',
  devServer: {
    contentBase: __dirname + '/dist'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/components/],
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
        include: [/components/],
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
              presets: ['@babel/react']
            }
          }
        ]
      }
    ]
  },
  plugins: []
}

if (mode === 'normal-with-dll') {
  config.plugins.push(
    new webpack.DllReferencePlugin({
      manifest: require('./manifest.json')
      // sourceType: 'commonjs2'
    })
  )
}

if (mode === 'normal' || mode === 'normal-with-dll') {
  config.entry.app = '.'

  config.plugins.push(
    new HtmlWebpackPlugin({
      template: './index.ejs'
    }),
    new AddAssetHtmlPlugin({ filepath: __dirname + '/dist/dll.js' })
  )
} else if (mode === 'dll') {
  config.entry.dll = ['./dll-entry']
  config.output.library = '[name]'
  config.plugins.push(
    new webpack.DllPlugin({
      name: '[name]',
      path: './manifest.json'
    })
  )
}

module.exports = config
