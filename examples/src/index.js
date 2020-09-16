import ReactDOM from 'react-dom'
import * as React from 'react'

import Button from './components/button'
import Avatar from './components/avatar'
import FullPage from './components/full-page'

const App = () => {
  const [fullPage, setFullPage] = React.useState(false)
  const fullPageRef = React.useRef()

  console.log('fullPageRef', fullPageRef)
  return (
    <div>
      <h1>App</h1>

      <Button onClick={() => setFullPage((f) => !f)}>切换</Button>
      {!fullPage ? <Avatar /> : <FullPage ref={fullPageRef} />}
    </div>
  )
}

ReactDOM.render(<App />, window.root)
