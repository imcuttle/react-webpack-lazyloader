require = require('esm')(module)
const webpack = require('webpack')
const Koa = require('koa')
const { promisify } = require('util')

const getWebpackConfig = require('./get-webpack-config')
const app = new Koa()

const webpackRun = async (mod) => {
  console.log(`Running webpack compiler: ${mod}`)
  const compiler = webpack(getWebpackConfig(mod))
  const stats = await promisify(compiler.run.bind(compiler))()
  console.log(
    stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    })
  )
}

;(async () => {
  await webpackRun('dll')
  await webpackRun('normal-with-dll')
  await webpackRun('ssr')

  const ssr = require('./reactSSRRender').default
  const mount = require('koa-mount')

  app.use(ssr())

  app.use(require('koa-static')(__dirname + '/dllDist', {}))
  app.use(require('koa-static')(__dirname + '/dist', {}))

  const port = 3000
  app.listen(port, () => console.log(`SSR Server run in http://localhost:${port}`))
})()
