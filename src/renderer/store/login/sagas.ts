import { all, call, fork, put, takeEvery, getContext } from 'redux-saga/effects'
import { LoginActionTypes } from './types'
import {
  loginSuccess,
  loginError,
  logoutError,
  logoutSuccess,
  loginRequest,
  refreshSuccess,
  refreshError,
  changePasswordRequest,
  changePasswordSuccess,
  changePasswordError,
} from './actions'
import { AuthenticationAPI } from '../../ipc/AuthenticationAPI'
import { SagaIterator } from 'redux-saga'
import { IPCError } from '../../../common/models/ipc/IPCError'

export function* handleLogin(
  action: ReturnType<typeof loginRequest>
): SagaIterator {
  try {
    const authAPI: AuthenticationAPI = yield getContext('authAPI')
    yield call(authAPI.login, action.payload.username, action.payload.password)
    yield put(loginSuccess())
  } catch (err) {
    if (err instanceof IPCError && err.getMessage()) {
      yield put(loginError(err.getMessage()))
    } else {
      yield put(loginError('An unknown error occured.'))
    }
  }
}

export function* handleLogout(): SagaIterator {
  try {
    const authAPI: AuthenticationAPI = yield getContext('authAPI')
    yield call(authAPI.logout)
    yield put(logoutSuccess())
  } catch (err) {
    if (err instanceof IPCError && err.getMessage()) {
      yield put(logoutError(err.getMessage()))
    } else {
      yield put(logoutError('An unknown error occured.'))
    }
  }
}

export function* handleRefresh(): SagaIterator {
  try {
    const authAPI: AuthenticationAPI = yield getContext('authAPI')
    yield call(authAPI.refresh)
    yield put(refreshSuccess())
  } catch (err) {
    if (err instanceof IPCError && err.getMessage()) {
      yield put(refreshError(err.getMessage()))
    } else {
      yield put(refreshError('An unknown error occured.'))
    }
  }
}

export function* handleChangePassword(
  action: ReturnType<typeof changePasswordRequest>
): SagaIterator {
  try {
    const authAPI: AuthenticationAPI = yield getContext('authAPI')
    yield call(
      authAPI.changePassword,
      action.payload.oldPassword,
      action.payload.newPassword
    )
    yield put(changePasswordSuccess())
  } catch (err) {
    if (err instanceof Error && err.message) {
      yield put(changePasswordError(err.message))
    } else {
      yield put(changePasswordError('An unknown error occured.'))
    }
  }
}

function* watchRequests(): SagaIterator {
  yield takeEvery(LoginActionTypes.LOGIN_REQUEST, handleLogin)
  yield takeEvery(LoginActionTypes.LOGOUT_REQUEST, handleLogout)
  yield takeEvery(LoginActionTypes.REFRESH_REQUEST, handleRefresh)
  yield takeEvery(LoginActionTypes.CHANGEPW_REQUEST, handleChangePassword)
}

function* loginSagas(): SagaIterator {
  yield all([fork(watchRequests)])
}

export default loginSagas
