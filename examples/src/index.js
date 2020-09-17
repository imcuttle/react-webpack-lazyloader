import ReactDOM from 'react-dom'
import * as React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { loadableReady } from '@loadable/component'
import { App } from './app'

loadableReady(() => {
  const render = window.root.innerHTML ? ReactDOM.hydrate : ReactDOM.render

  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    window.root
  )
})
