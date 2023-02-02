/**
 * The webpack loader for react component
 * 参考 https://github.com/webpack-contrib/style-loader/blob/master/src/index.js 实现
 * @author 余聪
 */
import { basename } from 'path'
import * as loaderUtils from 'loader-utils'
import { single } from 'quote-it'
import { transformAsync } from '@babel/core'

export const createPitch = (defaultConfig = {}) => {
  return async function reactLazyLoaderPitch(request) {
    const {
      lazyType,
      exposeNamedList,
      loadableModulePath,
      loadableBabelPluginModulePath,
      chunkName,
      getChunkName,
      jsx,
      esModule,
      fallback,
      fallbackRequest,
      maxDuration,
      wrapExposeComponentRequest,
      wrapExposeComponentProps
    } = Object.assign(
      {
        jsx: false,
        esModule: true,
        fallbackRequest: null,
        wrapExposeComponentRequest: null,
        wrapExposeComponentProps: null,
        lazyType: 'loadable', // React.lazy
        loadableModulePath: '@loadable/component',
        loadableBabelPluginModulePath: '@loadable/babel-plugin',
        getChunkName: (request) => {
          return request.replace(/^[./]+|\.([jt]sx?|json)$/g, '')
        },
        exposeNamedList: ['default'],
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
    const resourceName = basename(
      stringList[stringList.length - 1]
        .replace('!', '')
        .replace(/\?.*?$/, '')
        .replace(/\/index\..*?$/, '')
    )

    const stringedRequest = loaderUtils.stringifyRequest(this, `!!${request}`)

    const getComponentVarName = (label, name) => {
      if (!label) {
        return name
      }
      if (name === 'default') {
        return label
      }
      return `${label}_${name}`
    }
    const getLazyComponentsCode = () => {
      const getCode = (name) => {
        let thenCode = ';'
        if (name !== 'default') {
          thenCode = `.then(function(v) {
  var exposeVal = {
    default: v[${single(name)}]
  };
  Object.defineProperty(exposeVal, '__esModule', { value: true });
  return exposeVal;
});`
        }

        return `${lazyType === 'loadable' ? 'loadable' : 'React.lazy'}(function() {
   return import(/* webpackChunkName: ${loaderUtils.stringifyRequest(
     this,
     loaderUtils.interpolateName(this, chunkName ? chunkName : getChunkName(resourceName, request), {
       content: request
     })
   )} */${stringedRequest})${thenCode}
  }${lazyType === 'loadable' ? `, { fallback: fallbackItem }` : ''})`
      }

      return exposeNamedList
        .map((name) => `var ${getComponentVarName('LazyComponent', name)} = ${getCode(name).trim()};`)
        .join('\n')
    }

    const getExportComponentsCode = () => {
      const getCode = (name) => {
        return `React.forwardRef(function (props, ref) {
    var componentProps = Object.assign({}, props, {ref: ref});
    ${
      lazyType === 'loadable'
        ? `return ${
            !jsx
              ? `React.createElement(${getComponentVarName('LazyComponent', name)}, componentProps)`
              : `<${getComponentVarName('LazyComponent', name)} {...componentProps} />`
          };`
        : `var suspenseProps = {
      fallback: fallbackItem,
      maxDuration: ${maxDuration}
    };
    ${wrapExposeComponentRequest ? `var wrapperProps = ${JSON.stringify(wrapExposeComponentProps || {})};` : ''}
    ${
      !jsx
        ? `return React.createElement(React.Suspense, suspenseProps,
  ${wrapExposeComponentRequest ? `React.createElement(Wrapper, wrapperProps,` : ''}
    React.createElement(${getComponentVarName('LazyComponent', name)}, componentProps)
  ${wrapExposeComponentRequest ? `)` : ''}
);`
        : `return <React.Suspense {...suspenseProps}>
${wrapExposeComponentRequest ? `<Wrapper {...wrapperProps}>` : ''}
  <${getComponentVarName('LazyComponent', name)} {...componentProps} />
${wrapExposeComponentRequest ? `</Wrapper>` : ''}
</React.Suspense>;`
    }`
    }
  });`
      }

      return exposeNamedList
        .map((name) => {
          const getMainCode = (label = 'ExportComponent') =>
            `var ${getComponentVarName(label, name)} = ${getCode(name).trim()}`
          return esModule
            ? name === 'default'
              ? `${getMainCode()}\nexport default ${getComponentVarName('ExportComponent', name)};`
              : `export ${getMainCode('')}`
            : name === 'default'
            ? `${getMainCode()}\nmodule.exports = ${getComponentVarName('ExportComponent', name)};`
            : `${getMainCode()}\nexports.${name} = ${getComponentVarName('ExportComponent', name)};`
        })
        .join('\n')
    }

    const code = `
import * as React from 'react';
${wrapExposeComponentRequest ? `import Wrapper from ${single(wrapExposeComponentRequest)};` : ''}
${lazyType === 'loadable' ? `import loadable from ${single(loadableModulePath)};` : ''}
${fallbackRequest ? `import fallbackRequestItem from ${loaderUtils.stringifyRequest(this, fallbackRequest)};` : ''}
var fallbackItem = ${
      fallbackRequest
        ? `typeof fallbackRequestItem !== 'undefined' ? (fallbackRequestItem.__esModule ? fallbackRequestItem['default'] : fallbackRequestItem) : ${fallback}`
        : fallback
    };
${getLazyComponentsCode()}
${getExportComponentsCode()}`

    if (lazyType === 'loadable') {
      let plugins = []
      try {
        plugins.push(require.resolve(loadableBabelPluginModulePath))
      } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
          console.error(
            `react-webpack-lazyloader requires '@loadable/babel-plugin' when lazyType is 'loadable' and in SSR mode`
          )
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