import * as React from 'react'

import Button from './button'

export default React.forwardRef((props, ref) => {
  React.useImperativeHandle(
    ref,
    () => {
      return {
        foo: 'bar'
      }
    },
    []
  )

  return (
    <div>
      <h2>FullPage Component</h2>
      <Button>FullPage Button</Button>
    </div>
  )
})
