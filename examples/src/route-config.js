import { Switch, Route } from 'react-router-dom'
import React from 'react'

export default function routerConfig(routes = [], extraProps = {}, switchProps = {}) {
  if (extraProps === undefined) {
    extraProps = {}
  }

  if (switchProps === undefined) {
    switchProps = {}
  }

  return routes
    ? React.createElement(
        Switch,
        switchProps,
        routes.map((route, i) =>
          React.createElement(Route, {
            key: route.key || i,
            path: route.path,
            exact: route.exact,
            strict: route.strict,
            render: function render(props) {
              if (route.render) {
                return route.render({ ...props, ...extraProps, route })
              }
              return React.createElement(route.component, { ...props, ...extraProps, route })
            }
          })
        )
      )
    : null
}
