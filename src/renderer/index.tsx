import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { ConnectedRouter } from 'connected-react-router'
import routes from './routes'
import createStore, { history } from './createStore'
import { MuiThemeProvider } from '@material-ui/core'
import theme from './components/theme'
import { SnackbarProvider } from './providers/Snackbar'
import { StatusBarProvider } from './providers/StatusBar'
import { AuthenticationIPC } from './ipc/AuthenticationIPC'
import { BitcoinIPC } from './ipc/BitcoinIPC'
import { DlcEvents } from './ipc/DlcEvents'
import ProviderWrapper from './provider'

const store = createStore()
const dlcEvents = new DlcEvents(store)
dlcEvents.registerReplies()

ReactDOM.render(
  <ProviderWrapper store={store}>
    <MuiThemeProvider theme={theme}>
      <SnackbarProvider>
        <StatusBarProvider
          userFn={new AuthenticationIPC().getUser}
          balanceFn={new BitcoinIPC().getBalance}
        >
          <ConnectedRouter history={history}>{routes}</ConnectedRouter>
        </StatusBarProvider>
      </SnackbarProvider>
    </MuiThemeProvider>
  </ProviderWrapper>,
  document.getElementById('root')
)
