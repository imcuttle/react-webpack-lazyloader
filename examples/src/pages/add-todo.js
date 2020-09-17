import * as React from 'react'
import Button from '../components/button'

function AddTodo(props) {
  const [input, setInput] = React.useState('')

  return (
    <div className={'add-todo'}>
      <input placeholder={'输入代办'} type={'text'} value={input} onChange={(evt) => setInput(evt.target.value)} />
      <Button
        disabled={!input.trim()}
        onClick={() => {
          props.dispatch.globalData.addTodo({
            datetime: Date.now(),
            text: input,
            id: Math.random() + ''
          })
          props.history.push('/')
        }}
      >
        新增
      </Button>
    </div>
  )
}

export default AddTodo
