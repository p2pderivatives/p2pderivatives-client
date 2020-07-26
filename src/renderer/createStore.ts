import { routerMiddleware } from 'connected-react-router'
import { createHashHistory } from 'history'
import { applyMiddleware, createStore, Store } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import createSagaMiddleware from 'redux-saga'
import { AuthenticationIPC } from './ipc/consumer/AuthenticationIPC'
import { BitcoinIPC } from './ipc/consumer/BitcoinIPC'
import { DlcIPCRenderer } from './ipc/consumer/DlcIPCRenderer'
import { UserIPC } from './ipc/consumer/UserIPC'
import { ApplicationState, createRootReducer, rootSaga } from './store'

export const history = createHashHistory()

export default function configureStore(
  initialState?: ApplicationState
): Store<ApplicationState> {
  // create the composing function for our middlewares
  const composeEnhancers = composeWithDevTools({})
  // create the redux-saga middleware
  const sagaMiddleware = createSagaMiddleware({
    context: {
      authAPI: new AuthenticationIPC().events,
      userAPI: new UserIPC().events,
      bitcoinAPI: new BitcoinIPC().events,
      dlcAPI: new DlcIPCRenderer().events,
    },
  })

  const store = createStore(
    createRootReducer(history),
    initialState,
    composeEnhancers(applyMiddleware(routerMiddleware(history), sagaMiddleware))
  )

  sagaMiddleware.run(rootSaga)
  return store
}
