import * as React from 'react'
import Button from '../button'

import './style.css'

export default ({ datetime, status, text, onRemove, onStatusChange }) => (
  <div className={'todo'} data-status={status}>
    <input
      type="checkbox"
      checked={status === 'done'}
      onChange={(evt) => {
        onStatusChange && onStatusChange(evt.target.checked ? 'done' : 'todo')
      }}
    />

    <span className={'todo-datetime'}>{new Date(datetime).toUTCString()}</span>
    <span className={'todo-text'}>{text}</span>
    <span className={'todo-btns'}>
      <Button onClick={onRemove}>删除</Button>
    </span>
  </div>
)
