import React from 'react'
import './App.css'
import { Provider } from 'react-redux'
import createStore from '../../createStore'
import { ApplicationState } from '../../store'
import { initialState as loginState } from '../../store/login/reducer'
import { initialState as userState } from '../../store/user/reducer'

// stub for when we have stored data
const defaultState: ApplicationState = {
  login: loginState,
  user: userState,
}

const store = createStore(defaultState)

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="App">
        <header className="App-header">
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    </Provider>
  )
}

export default App
