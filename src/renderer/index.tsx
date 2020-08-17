import { MuiThemeProvider } from '@material-ui/core'
import { ConnectedRouter } from 'connected-react-router'
import React from 'react'
import ReactDOM from 'react-dom'
import { setEventIPCHandler } from '../common/ipc/IPC'
import { isFailed } from '../common/utils/failable'
import theme from './components/theme'
import createStore, { history } from './createStore'
import './index.css'
import { AuthenticationIPC } from './ipc/consumer/AuthenticationIPC'
import { BitcoinIPC } from './ipc/consumer/BitcoinIPC'
import { DlcEvents } from './ipc/event/DlcEvents'
import { ElectronIPCRendererHandler } from './ipc/handler/ElectronIPCRendererHandler'
import ProviderWrapper from './provider'
import { SnackbarProvider } from './providers/Snackbar'
import { StatusBarProvider } from './providers/StatusBar'
import routes from './routes'

setEventIPCHandler(new ElectronIPCRendererHandler())

const store = createStore()
const dlcEvents = new DlcEvents(store)
dlcEvents.registerReplies()
const authIPCConsumer = new AuthenticationIPC()
const bitcoindIPCConsumer = new BitcoinIPC()
const getUserHandler = async (): Promise<string> => {
  const res = await authIPCConsumer.events.getUser()
  if (isFailed(res)) {
    return 'N/A'
  }
  return res.value
}

const getBalanceHandler = async (): Promise<number> => {
  const res = await bitcoindIPCConsumer.events.getBalance()
  if (isFailed(res)) {
    return NaN
  }
  return res.value
}

ReactDOM.render(
  <ProviderWrapper store={store}>
    <MuiThemeProvider theme={theme}>
      <SnackbarProvider>
        <StatusBarProvider
          userFn={getUserHandler}
          balanceFn={getBalanceHandler}
        >
          <ConnectedRouter history={history}>{routes}</ConnectedRouter>
        </StatusBarProvider>
      </SnackbarProvider>
    </MuiThemeProvider>
  </ProviderWrapper>,
  document.getElementById('root')
)
