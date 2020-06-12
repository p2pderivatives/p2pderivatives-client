import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import routes from './routes'
import createStore, { history } from './createStore'
import { MuiThemeProvider } from '@material-ui/core'
import theme from './components/theme'
import { SnackbarProvider } from './providers/Snackbar'
import { UserProvider } from './providers/User'
import { AuthenticationIPC } from './ipc/AuthenticationIPC'

const store = createStore()

ReactDOM.render(
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <SnackbarProvider>
        <UserProvider userFn={new AuthenticationIPC().getUser}>
          <ConnectedRouter history={history}>{routes}</ConnectedRouter>
        </UserProvider>
      </SnackbarProvider>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('root')
)
