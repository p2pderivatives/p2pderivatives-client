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
import { DlcEvents } from './ipc/DlcEvents'

const store = createStore()
const dlcEvents = new DlcEvents(store)
dlcEvents.registerReplies()

ReactDOM.render(
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <SnackbarProvider>
        <ConnectedRouter history={history}>{routes}</ConnectedRouter>
      </SnackbarProvider>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('root')
)
