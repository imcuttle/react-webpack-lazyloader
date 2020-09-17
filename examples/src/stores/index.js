import { init } from '@rematch/core'
import immerPlugin from '@rematch/immer'
import models from './allModels'

// 把服务端渲染状态数据同步到客户端
if (typeof window !== 'undefined' && typeof window.initialData === 'object') {
  const SSR_STATE = window.initialData || {}
  Object.keys(models).forEach((key) => {
    if (SSR_STATE[key]) {
      models[key].state = SSR_STATE[key]
    }
  })
}

const immer = immerPlugin()
const store = init({
  models,
  plugins: [immer]
})

export default store
