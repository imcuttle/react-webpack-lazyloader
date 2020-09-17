import TodoList from './pages/todo-list'
import AddTodo from './pages/add-todo'

import { connect } from 'react-redux'

const connectComponent = (Component) => {
  const mapState = (state) => state

  const mapDispatch = (dispatch, ...arg) => {
    return { dispatch: dispatch }
  }

  return connect(mapState, mapDispatch)(Component)
}

export default [
  {
    path: '/add',
    exact: true,
    component: connectComponent(AddTodo)
  },
  {
    path: '/',
    exact: true,
    component: connectComponent(TodoList)
  }
]
