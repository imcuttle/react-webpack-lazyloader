/**
 * @file main
 * @author imcuttle
 * @date 2018/4/4
 */
import { fixture, compiler } from './helper'
import * as nodeExternals from 'webpack-node-externals'
import * as React from 'react'
import * as nps from 'path'
import * as TestRenderer from 'react-test-renderer'

const delay = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout))

const evalCode = (stats: any, filename = 'bundle.js') => {
  const fs = stats.compilation.compiler.outputFileSystem
  const content = fs.readFileSync(nps.resolve(__dirname, filename)).toString()

  const mod = {
    exports: {}
  }
  // console.log('content', content)
  new Function('module', 'exports', 'require', content)(mod, mod.exports, (id) => {
    if (fs.existsSync(nps.resolve(__dirname, id))) {
      return evalCode(stats, id)
    }
    return require(id)
  })
  return mod.exports['__esModule'] ? mod.exports['default'] : mod.exports
}

class ErrorBoundary extends React.Component<any, any> {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
    console.error(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>
    }

    return this.props.children
  }
}

describe('reactLazyloader', function () {
  it('normal case, match output sourceCode', async function () {
    const { output, stats } = await compiler('button')
    expect(output).toMatchInlineSnapshot(`
      "
        import {lazy, Suspense} from 'react';
        import * as React from 'react';
        
        var fallbackItem = null;
        // request
        var LazyComponent = lazy(function() {
         return import(/* webpackChunkName: \\"button\\" */\\"!!../../../node_modules/babel-loader/lib/index.js??ref--5-0!./index.js\\");
        });
        var ExportComponent = React.forwardRef(function (props, ref) {
          var suspenseProps = {
            fallback: fallbackItem,
            maxDuration: 0
          };
          var componentProps = Object.assign({}, props, {ref: ref});
          return React.createElement(React.Suspense, suspenseProps, React.createElement(LazyComponent, componentProps));
        });

        export default ExportComponent;
        "
    `)
  })

  it('inline querystring & option', async function () {
    const { output, stats } = await compiler('button?maxDuration=1000', {
      fallback: 'React.createElement("div")'
    })
    expect(output).toMatch('/* webpackChunkName: "button" */')
    expect(output).toMatch('maxDuration: 1000')
    expect(output).toMatch('fallbackItem = React.createElement("div")')
  })

  it('with fallbackRequest option', async function () {
    const { stats } = await compiler(
      'button',
      {
        fallbackRequest: fixture('loading')
      },
      {}
    )
    const json = stats.toJson()
    const compiledOutput = json.modules[stats.toJson().modules.length - 2].source
    expect(compiledOutput).toMatch('import fallbackRequestItem from "../loading"')
  })

  it('run bundle.js well', async function () {
    const { stats } = await compiler(
      'button',
      {
        fallbackRequest: fixture('loading')
      },
      {
        target: 'node',
        output: {
          libraryTarget: 'commonjs2'
        },
        externals: [nodeExternals()]
      }
    )

    expect(React.isValidElement(React.createElement(evalCode(stats)))).toBeTruthy()
  })

  it('render bundle.js well', async function () {
    const { stats } = await compiler(
      'button',
      {
        fallbackRequest: fixture('loading')
      },
      {
        target: 'node',
        output: {
          libraryTarget: 'commonjs2'
        },
        externals: [nodeExternals()]
      }
    )
    const Component = evalCode(stats)
    const testRenderer = TestRenderer.create(
      <ErrorBoundary>
        <Component title={'Title'} />
      </ErrorBoundary>
    )

    expect(testRenderer.toJSON()).toMatchInlineSnapshot(`"loading"`)

    await delay(0)
    expect(testRenderer.toJSON()).toMatchInlineSnapshot(`
      <button>
        button
      </button>
    `)
  })
})
