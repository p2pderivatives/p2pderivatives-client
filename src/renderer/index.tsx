import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import * as serviceWorker from './serviceWorker'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import routes from './routes'
import createStore, { history } from './createStore'
import { MuiThemeProvider } from '@material-ui/core'
import theme from './components/theme'
import { SnackbarProvider } from './providers/Snackbar'

const store = createStore()

ReactDOM.render(
  <Provider store={store}>
    <SnackbarProvider>
      <MuiThemeProvider theme={theme}>
        <ConnectedRouter history={history}>{routes}</ConnectedRouter>
      </MuiThemeProvider>
    </SnackbarProvider>
  </Provider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
