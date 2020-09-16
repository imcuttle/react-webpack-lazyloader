/**
 * The webpack loader for react component
 * 参考 https://github.com/webpack-contrib/style-loader/blob/master/src/index.js 实现
 * @author 余聪
 */
import * as loaderUtils from 'loader-utils'

/**
 * Input: 'x-button'
 * export default () => <button></button>
 *
 * Output:
 * const Component = React.lazy(() => import('!!x-button'))
 * const Button = React.forward(function Button (props, ref) {
 *   return <Suspense>
 *     <Component ref={ref} {...props} />
 *   </Suspense>
 * })
 * export default Button
 *
 * @param request
 */
export const pitch = function reactLazyLoader(request) {
  const { chunkName, getChunkName, jsx, esModule, fallback, fallbackRequest, maxDuration } = Object.assign(
    {
      jsx: false,
      esModule: true,
      fallbackRequest: null,
      getChunkName: (request) => {
        return request.replace(/^[./]+|\.([jt]sx?|json)$/g, '')
      },
      chunkName: null,
      fallback: 'null',
      maxDuration: 0
    },
    loaderUtils.getOptions(this) || {},
    loaderUtils.parseQuery(this.resourceQuery || '?')
  )

  const stringList = JSON.parse(loaderUtils.stringifyRequest(this, request)).split('!')
  // 获取 basename，去除后缀和 querystring
  const name = stringList[stringList.length - 1].replace('!', '').replace(/\?.*?$/, '')

  const stringedRequest = loaderUtils.stringifyRequest(this, `!!${request}`)

  const code = `
  import {lazy, Suspense} from 'react';
  import * as React from 'react';
  ${fallbackRequest ? `import fallbackRequestItem from ${loaderUtils.stringifyRequest(this, fallbackRequest)};` : ''}
  var fallbackItem = ${
    fallbackRequest
      ? `typeof fallbackRequestItem !== 'undefined' ? (fallbackRequestItem.__esModule ? fallbackRequestItem['default'] : fallbackRequestItem) : ${fallback}`
      : fallback
  };
  // request
  var LazyComponent = lazy(function() {
   return import(/* webpackChunkName: ${
     chunkName ? JSON.stringify(chunkName) : loaderUtils.stringifyRequest(this, getChunkName(name))
   } */${stringedRequest});
  });
  var ExportComponent = React.forwardRef(function (props, ref) {
    var suspenseProps = {
      fallback: fallbackItem,
      maxDuration: ${maxDuration}
    };
    var componentProps = Object.assign({}, props, {ref: ref});
    ${
      !jsx
        ? `return React.createElement(React.Suspense, suspenseProps, React.createElement(LazyComponent, componentProps));`
        : `return <Suspense {...suspenseProps}>
  <Component {...componentProps} />
</Suspense>;`
    }
  });

  ${esModule ? `export default ` : `module.exports = `}ExportComponent;
  `
  return code
}
