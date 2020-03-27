import { combineReducers } from 'redux'
import { all, fork } from 'redux-saga/effects'

import loginSaga from './login/sagas'
import { loginReducer } from './login/reducer'
import { LoginState } from './login/types'
import userSaga from './user/sagas'
import { userReducer } from './user/reducer'
import { UserState } from './user/types'
import { bitcoinReducer } from './bitcoin/reducer'
import { BitcoinState } from './bitcoin/types'
import bitcoinSaga from './bitcoin/sagas'
import { History } from 'history'
import { connectRouter, RouterState } from 'connected-react-router'

export interface ApplicationState {
  login: LoginState
  user: UserState
  bitcoin: BitcoinState
  router: RouterState
}

export const createRootReducer = (history: History) =>
  combineReducers({
    login: loginReducer,
    user: userReducer,
    bitcoin: bitcoinReducer,
    router: connectRouter(history),
  })

export function* rootSaga() {
  yield all([fork(loginSaga), fork(userSaga), fork(bitcoinSaga)])
}
