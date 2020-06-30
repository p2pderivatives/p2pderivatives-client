// `react-router-redux` is deprecated, so we use `connected-react-router`.
// This provides a Redux middleware which connects to our `react-router` instance.
import { routerMiddleware } from 'connected-react-router'
// If you use react-router, don't forget to pass in your history type.
import { createHashHistory } from 'history'
import { applyMiddleware, createStore, Store } from 'redux'
// We'll be using Redux Devtools. We can use the `composeWithDevTools()`
// directive so we can pass our middleware along with it
import { composeWithDevTools } from 'redux-devtools-extension'
import createSagaMiddleware from 'redux-saga'
import { AuthenticationIPC } from './ipc/AuthenticationIPC'
import { BitcoinIPC } from './ipc/BitcoinIPC'
import { UserIPC } from './ipc/UserIPC'
// Import the state interface and our combined reducers/sagas.
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
      authAPI: new AuthenticationIPC(),
      userAPI: new UserIPC(),
      bitcoinAPI: new BitcoinIPC(),
    },
  })

  // We'll create our store with the combined reducers/sagas, and the initial Redux state that
  // we'll be passing from our entry point.
  const store = createStore(
    createRootReducer(history),
    initialState,
    composeEnhancers(applyMiddleware(routerMiddleware(history), sagaMiddleware))
  )

  // Don't forget to run the root saga, and return the store object.
  sagaMiddleware.run(rootSaga)
  return store
}
