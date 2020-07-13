import { routerMiddleware } from 'connected-react-router'
import { createHashHistory } from 'history'
import { applyMiddleware, createStore, Store } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import createSagaMiddleware from 'redux-saga'
import { AuthenticationIPC } from './ipc/AuthenticationIPC'
import { BitcoinIPC } from './ipc/BitcoinIPC'
import { UserIPC } from './ipc/UserIPC'
import { ApplicationState, createRootReducer, rootSaga } from './store'
import { DlcIPCRenderer } from './ipc/DlcIPCRenderer'

export const history = createHashHistory()

export default function configureStore(
  initialState?: ApplicationState
): Store<ApplicationState> {
  // create the composing function for our middlewares
  const composeEnhancers = composeWithDevTools({})
  // create the redux-saga middleware
  const sagaMiddleware = createSagaMiddleware({
    context: {
      authAPI: new AuthenticationIPC(),
      userAPI: new UserIPC(),
      bitcoinAPI: new BitcoinIPC(),
      dlcAPI: new DlcIPCRenderer(),
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
