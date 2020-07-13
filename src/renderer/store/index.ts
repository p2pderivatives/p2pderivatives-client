import { combineReducers, Reducer, AnyAction } from 'redux'
import { all, fork, AllEffect, ForkEffect } from 'redux-saga/effects'

import loginSaga from './login/sagas'
import { loginReducer } from './login/reducer'
import { LoginState } from './login/types'
import userSaga from './user/sagas'
import { userReducer } from './user/reducer'
import { UserState } from './user/types'
import { bitcoinReducer } from './bitcoin/reducer'
import { BitcoinState } from './bitcoin/types'
import bitcoinSaga from './bitcoin/sagas'
import { DlcState } from './dlc/types'
import { dlcReducer } from './dlc/reducer'
import dlcSaga from './dlc/sagas'
import { History } from 'history'
import { connectRouter, RouterState } from 'connected-react-router'

export interface ApplicationState {
  login: LoginState
  user: UserState
  bitcoin: BitcoinState
  dlc: DlcState
  router: RouterState
}

type RootReducer = Reducer<ApplicationState, AnyAction>

export const createRootReducer = (history: History): RootReducer =>
  combineReducers({
    login: loginReducer,
    user: userReducer,
    bitcoin: bitcoinReducer,
    dlc: dlcReducer,
    router: connectRouter(history),
  })

type RootSaga = Generator<AllEffect<ForkEffect>, void, unknown>

export function* rootSaga(): RootSaga {
  yield all([fork(loginSaga), fork(userSaga), fork(bitcoinSaga), fork(dlcSaga)])
}
