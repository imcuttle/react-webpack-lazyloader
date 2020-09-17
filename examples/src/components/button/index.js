import * as React from 'react'
import './style.css'

export default ({ children, ...props }) => (
  <button className={'button'} {...props}>
    {children}
  </button>
)
