/**
 * @file helper
 */

const nps = require('path')
const webpack = require('webpack')
const Memoryfs = require('memory-fs')
const merge = require('lodash/merge')

function fixture(...argv) {
  return nps.join.apply(nps, [__dirname, 'fixture'].concat(argv))
}

const compiler = (fixtureName, options = {}, config?): any => {
  let entryFilename
  let pureFilename
  const index = fixtureName.indexOf('?')
  if (index >= 0) {
    const queryString = fixtureName.slice(index)
    pureFilename = fixture(fixtureName.slice(0, index))
    entryFilename = pureFilename + queryString
  } else {
    entryFilename = pureFilename = fixture(fixtureName)
  }

  const compiler = webpack(
    merge(
      {
        context: fixture('../output'),
        entry: [entryFilename],
        output: {
          path: nps.resolve(__dirname),
          chunkFilename: '[name].chunk.js',
          filename: 'bundle.js'
        },
        mode: 'development',
        module: {
          rules: [
            {
              // include: [entryFilename],
              // // exclude: [(filename) => filename !== entryFilename],
              test: [pureFilename, fixture('button')],
              use: [
                // {
                //   loader: 'babel-loader',
                //   options: {
                //     presets: ['@babel/react']
                //   }
                // },
                {
                  loader: require.resolve('../src'),
                  options: {
                    chunkName: null,
                    ...options
                  }
                }
              ]
            },
            {
              test: /\.jsx?$/,
              use: [
                {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/react']
                  }
                }
              ]
            }
          ]
        }
      },
      config
    )
  )

  compiler.outputFileSystem = new Memoryfs()

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) reject(err || stats.compilation.errors[0])

      resolve({
        stats,
        output: stats.toJson().modules[stats.toJson().modules.length - 1].source
      } as any)
    })
  })
}

export { fixture, compiler }
