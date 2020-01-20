import { all, call, fork, put, takeEvery, getContext } from 'redux-saga/effects'
import { LoginActionTypes } from './types'
import {
  loginSuccess,
  loginError,
  logoutError,
  logoutSuccess,
  loginRequest,
} from './actions'
import { AuthenticationAPI } from '../../ipc/AuthenticationAPI'

export function* handleLogin(action: ReturnType<typeof loginRequest>) {
  try {
    const authAPI: AuthenticationAPI = yield getContext('authAPI')
    yield call(authAPI.login, action.payload.username, action.payload.password)
    yield put(loginSuccess())
  } catch (err) {
    if (err instanceof Error && err.message) {
      yield put(loginError(err.message))
    } else {
      yield put(loginError('An unknown error occured.'))
    }
  }
}

export function* handleLogout() {
  try {
    const authAPI: AuthenticationAPI = yield getContext('authAPI')
    yield call(authAPI.logout)
    yield put(logoutSuccess())
  } catch (err) {
    if (err instanceof Error && err.message) {
      yield put(logoutError(err.message))
    } else {
      yield put(logoutError('An unknown error occured.'))
    }
  }
}

function* watchRequests() {
  yield takeEvery(LoginActionTypes.LOGIN_REQUEST, handleLogin)
  yield takeEvery(LoginActionTypes.LOGOUT_REQUEST, handleLogout)
}

function* loginSagas() {
  yield all([fork(watchRequests)])
}

export default loginSagas
