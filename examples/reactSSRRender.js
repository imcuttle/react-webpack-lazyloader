import * as React from 'react'
import { StaticRouter, matchPath } from 'react-router-dom'
import { renderToString } from 'react-dom/server'
import { ChunkExtractor } from '@loadable/server'
import * as nps from 'path'
import { readFileSync } from 'fs'

import { store, App, routes } from './ssrDist'

const htmlContent = readFileSync(nps.resolve(__dirname, 'dist/index.html'), 'utf8')

export default function ssrRender() {
  return async (ctx, next) => {
    const activeRoute = routes.find((route) => matchPath(ctx.url, route))
    if (!activeRoute) return next()

    await store.dispatch.globalData.getData()
    console.log(activeRoute, ctx.url)

    const statsFile = nps.resolve(__dirname, 'dllDist/loadable-stats.json')
    const extractor = new ChunkExtractor({ statsFile, entrypoints: ['dll'] })
    const context = {}

    // Wrap your application using "collectChunks"
    const jsx = extractor.collectChunks(
      <StaticRouter location={ctx.url} context={context}>
        <App store={store} />
      </StaticRouter>
    )
    const html = renderToString(jsx)
    // console.log('htmlContent', htmlContent
    //   .replace(
    //     '<!--ssr_head-->',
    //     `${extractor.getLinkTags()}
    //     ${extractor.getStyleTags()}`
    //   ))
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
</script>` + extractor.getScriptTags()
      )
      .replace('<!--ssr_html-->', html)
    ctx.body = output
  }
}
