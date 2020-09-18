import * as React from 'react'
import { StaticRouter, matchPath } from 'react-router-dom'
import { renderToString } from 'react-dom/server'
import { ChunkExtractor } from '@loadable/server'
import * as nps from 'path'
import { readFileSync } from 'fs'
import { mergeWith } from 'lodash'

const htmlContent = readFileSync(nps.resolve(__dirname, 'src/index.ejs'), 'utf8')

export default function ssrRender() {
  return async (ctx, next) => {
    const ssrStatsFile = nps.resolve(__dirname, 'ssrDist/loadable-stats.json')
    const { store, App, routes } = new ChunkExtractor({
      statsFile: ssrStatsFile,
      entrypoints: ['index']
    }).requireEntrypoint()

    const activeRoute = routes.find((route) => matchPath(ctx.url, route))
    if (!activeRoute) return next()

    await store.dispatch.globalData.getData()
    console.log(activeRoute, ctx.url)

    const merge = (a, b) => {
      return mergeWith(a, b, function customizer(objValue, srcValue) {
        if (Array.isArray(objValue) || Array.isArray(srcValue)) {
          return (objValue || []).concat(srcValue || [])
        }
      })
    }

    // 合并 dll stats 和 app stats，因为两者均有可能具有 chunk
    const statsFile = nps.resolve(__dirname, 'dist/loadable-stats.json')
    const dllStatsFile = nps.resolve(__dirname, 'dllDist/loadable-stats.json')
    const stats = merge(merge({}, require(statsFile)), require(dllStatsFile))
    const extractor = new ChunkExtractor({ stats: stats, entrypoints: ['dll', 'app'] })

    const context = {}
    const jsx = extractor.collectChunks(
      React.createElement(
        StaticRouter,
        {
          location: ctx.url,
          context: context
        },
        React.createElement(App, { store })
      )
    )
    const html = renderToString(jsx)

    ctx.type = 'html'
    const output = htmlContent
      .replace(
        '<!--ssr_head-->',
        `${extractor.getLinkTags()}
        ${extractor.getStyleTags()}`
      )
      .replace(
        '<!--ssr_script-->',
        `<script>
window.initialData = ${JSON.stringify(store.getState())};
</script>` + extractor.getScriptTags({}).replace(/async/, '')
      )
      .replace('<!--ssr_html-->', html)
    ctx.body = output
  }
}
