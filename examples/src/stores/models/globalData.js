// import produce from "immer"

const initData = {
  todoList: [
    {
      id: Math.random() + '',
      text: '吃饭',
      status: 'done',
      datetime: Date.now()
    }
  ]
}

export default {
  state: initData,
  reducers: {
    setData(state, payload) {
      return payload
    },
    updateData(state, payload) {
      return { ...state, ...payload }
    },
    addTodo(state, payload) {
      return { ...state, todoList: state.todoList.concat(payload) }
    },

    removeTodo(state, id) {
      const todoIndex = state.todoList.findIndex((todo) => todo.id === id)
      if (todoIndex >= 0) {
        state.todoList.splice(todoIndex, 1)
      }
      return state
    },
    updateTodoStatus(state, id, status) {
      const todoIndex = state.todoList.findIndex((todo) => todo.id === id)
      if (todoIndex >= 0) {
        state.todoList[todoIndex].status = status
      }
      return state
    }
  },
  effects: (dispatch) => ({
    async getData(payload, rootState) {
      // console.log('全局数据:', rootState)
      // console.dir(dispatch)
      dispatch.globalData.updateData({
        todoList: [
          {
            id: Math.random() + '',
            text: '吃饭 from Server',
            status: 'done',
            datetime: Date.now()
          }
        ]
      })
    }
  })
}
