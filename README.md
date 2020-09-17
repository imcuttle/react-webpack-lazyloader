# react-webpack-lazyloader

[![Build status](https://img.shields.io/travis/余聪/react-webpack-lazyloader/master.svg?style=flat-square)](https://travis-ci.org/余聪/react-webpack-lazyloader)
[![Test coverage](https://img.shields.io/codecov/c/github/余聪/react-webpack-lazyloader.svg?style=flat-square)](https://codecov.io/github/余聪/react-webpack-lazyloader?branch=master)
[![NPM version](https://img.shields.io/npm/v/react-webpack-lazyloader.svg?style=flat-square)](https://www.npmjs.com/package/react-webpack-lazyloader)
[![NPM Downloads](https://img.shields.io/npm/dm/react-webpack-lazyloader.svg?style=flat-square&maxAge=43200)](https://www.npmjs.com/package/react-webpack-lazyloader)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://prettier.io/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square)](https://conventionalcommits.org)

> The webpack loader for fetch react component async

用于异步按需加载 React Component, 支持 Dll 按需加载，推荐在 **微前端项目 或 大组件加载 或 服务端支持 H2** 的时候使用

## Installation

```bash
npm install react-webpack-lazyloader @loadable/babel-plugin -D
# or use yarn
yarn add react-webpack-lazyloader @loadable/babel-plugin --dev
```

## How it works?

- Origin Button

```jsx
export default () => <button></button>
```

- Transformed Button after `react-webpack-lazyloader`

```jsx
import loadable from '@loadable/babel-plugin'
const Component = loadable(() => import('!!BUTTON_REQUEST'))
const Button = React.forward(function Button(props, ref) {
  return <Component ref={ref} {...props} />
})
export default Button
```

## Usage

### 正常使用

```jsx
import Button from 'react-webpack-lazyloader!./button'

// 按照正常逻辑使用
;<Button>button</Button>
```

### 结合 DllPlugin

使用 DllPlugin，会预先把 chunk 一个个分离好，在 main.js 中则会按照 dll chunk 进行加载，比较**适合母子前端工程使用**

例子请看：[examples](./examples)

**注意：** Dll 模式下的组件更新，不会热替换，可能需要 IPC (Dll watch <-> Dev Server)，后续进行完善

## Options

### `lazyType`

使用 [`@loadable/component`](https://github.com/gregberge/loadable-components) 还是 `React.lazy` 方式实现异步加载，其中 `@loadable/component` 支持 [SSR](./examples)

- Type: `'loadable' | 'React.lazy'`
- Default: `'loadable'`

### `fallback`

需要是可以正确注入的表达式字符串，如 `'"加载中"'` 而不能是 `'加载中'`

可以是 `<Spin/>`

- Type: `string`
- Default: `'null'`

### `fallbackRequest`

Suspend 中 fallback 参数的引用 element，如 `/path/to/loading.js`，可以保证 `/path/to/loading.js` 被正确 loader 转换

- `loading.js`

```jsx
import * as React from 'react'
export default <Spin />
```

- Type: `string`
- Default: `'null'`

### `jsx`

是否用 JSX 语法，否则用 `React.createElement`

- Type: `boolean`
- Default: `false`

### `chunkName`

chunk name

- Type: `string`
- Default: `null`

## Contributing

- Fork it!
- Create your new branch:  
  `git checkout -b feature-new` or `git checkout -b fix-which-bug`
- Start your magic work now
- Make sure npm test passes
- Commit your changes:  
  `git commit -am 'feat: some description (close #123)'` or `git commit -am 'fix: some description (fix #123)'`
- Push to the branch: `git push`
- Submit a pull request :)

## Authors

This library is written and maintained by 余聪, <a href="mailto:yucong06@meituan.com">yucong06@meituan.com</a>.

## License

MIT - [余聪](https://github.com/余聪) 🐟
