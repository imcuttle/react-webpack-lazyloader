import Todo from '../components/todo'

import * as React from 'react'

export default function TodoList(props) {
  const { todoList } = props.globalData
  return (
    <ul className={'todo-list'}>
      {todoList.map((todo) => (
        <Todo
          {...todo}
          key={todo.id}
          onRemove={() => {
            props.dispatch.globalData.removeTodo(todo.id)
          }}
          onStatusChange={(status) => {
            props.dispatch.globalData.updateTodoStatus(todo.id, status)
          }}
        />
      ))}
    </ul>
  )
}
