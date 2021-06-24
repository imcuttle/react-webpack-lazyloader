/**
 * The webpack loader for react component
 * 参考 https://github.com/webpack-contrib/style-loader/blob/master/src/index.js 实现
 * @author 余聪
 */
import { basename } from 'path'
import * as loaderUtils from 'loader-utils'
import { transformAsync } from '@babel/core'

export const createPitch = (defaultConfig = {}) => {
  return async function reactLazyLoaderPitch(request) {
    const { lazyType, chunkName, getChunkName, jsx, esModule, fallback, fallbackRequest, maxDuration } = Object.assign(
      {
        jsx: false,
        esModule: true,
        fallbackRequest: null,
        lazyType: 'loadable', // React.lazy
        getChunkName: (request) => {
          return request.replace(/^[./]+|\.([jt]sx?|json)$/g, '')
        },
        chunkName: 'react-lazy-[name]-[contenthash:8]',
        fallback: 'null',
        maxDuration: 0
      },
      defaultConfig,
      loaderUtils.getOptions(this) || {},
      loaderUtils.parseQuery(this.resourceQuery || '?')
    )

    const stringList = request.split('!')
    // 获取 basename，去除后缀和 querystring
    const name = basename(
      stringList[stringList.length - 1]
        .replace('!', '')
        .replace(/\?.*?$/, '')
        .replace(/\/index\..*?$/, '')
    )

    const stringedRequest = loaderUtils.stringifyRequest(this, `!!${request}`)

    const code = `
  import * as React from 'react';
  ${lazyType === 'loadable' ? `import loadable from '@loadable/component';` : ''}
  ${fallbackRequest ? `import fallbackRequestItem from ${loaderUtils.stringifyRequest(this, fallbackRequest)};` : ''}
  var fallbackItem = ${
    fallbackRequest
      ? `typeof fallbackRequestItem !== 'undefined' ? (fallbackRequestItem.__esModule ? fallbackRequestItem['default'] : fallbackRequestItem) : ${fallback}`
      : fallback
  };
  var LazyComponent = ${lazyType === 'loadable' ? 'loadable' : 'React.lazy'}(function() {
   return import(/* webpackChunkName: ${loaderUtils.stringifyRequest(
     this,
     loaderUtils.interpolateName(this, chunkName ? chunkName : getChunkName(name, request), { content: request })
   )} */${stringedRequest});
  }${lazyType === 'loadable' ? `, { fallback: fallbackItem }` : ''});
  var ExportComponent = React.forwardRef(function (props, ref) {
    var componentProps = Object.assign({}, props, {ref: ref});
    ${
      lazyType === 'loadable'
        ? `return ${
            !jsx ? `React.createElement(LazyComponent, componentProps)` : `<LazyComponent {...componentProps} />`
          };`
        : `var suspenseProps = {
      fallback: fallbackItem,
      maxDuration: ${maxDuration}
    };
    ${
      !jsx
        ? `return React.createElement(React.Suspense, suspenseProps, React.createElement(LazyComponent, componentProps));`
        : `return <React.Suspense {...suspenseProps}>
  <Component {...componentProps} />
</React.Suspense>;`
    }`
    }
  });

  ${esModule ? `export default ` : `module.exports = `}ExportComponent;
  `

    if (lazyType === 'loadable') {
      let plugins = []
      try {
        plugins.push(require.resolve('@loadable/babel-plugin'))
      } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
          throw new Error(`react-webpack-lazyloader requires '@loadable/babel-plugin' when lazyType is 'loadable'`)
        }
      }

      const result = await transformAsync(code, {
        configFile: false,
        presets: [require.resolve('@babel/preset-react')],
        plugins
      })
      return result.code
    }

    return code
  }
}
