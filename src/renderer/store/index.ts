import { combineReducers } from 'redux'
import { all, fork } from 'redux-saga/effects'

import loginSaga from './login/sagas'
import { loginReducer } from './login/reducer'
import { LoginState } from './login/types'
import userSaga from './user/sagas'
import { userReducer } from './user/reducer'
import { UserState } from './user/types'

export interface ApplicationState {
  login: LoginState
  user: UserState
}

export const createRootReducer = () =>
  combineReducers({
    login: loginReducer,
    user: userReducer,
  })

export function* rootSaga() {
  yield all([fork(loginSaga), fork(userSaga)])
}
