import * as React from 'react'
import { Provider } from 'react-redux'
import { NavLink } from 'react-router-dom'

import renderRoutes from './route-config'
import routes from './routes'
import globalStore from './stores'

import './style.css'

export { default as routes } from './routes'

export const App = ({ store = globalStore }) => {
  return (
    <Provider store={store}>
      <div className={'app'}>
        <div className={'nav'}>
          菜单 =>
          <NavLink exact activeStyle={{ fontWeight: 'bold' }} to={'/'}>
            待办列表
          </NavLink>
          <NavLink exact activeStyle={{ fontWeight: 'bold' }} to={'/add'}>
            新增待办
          </NavLink>
        </div>
        {renderRoutes(routes)}
      </div>
    </Provider>
  )
}
