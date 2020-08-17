import { SagaIterator } from 'redux-saga'
import { all, call, fork, getContext, put, takeEvery } from 'redux-saga/effects'
import { AuthChannels } from '../../../common/ipc/model/authentication'
import { isFailed } from '../../../common/utils/failable'
import { ReturnTypeAsync } from '../../../common/utils/types'
import {
  changePasswordError,
  changePasswordRequest,
  changePasswordSuccess,
  loginError,
  loginRequest,
  loginSuccess,
  logoutError,
  logoutSuccess,
  refreshError,
  refreshSuccess,
} from './actions'
import { LoginActionTypes } from './types'
export function* handleLogin(
  action: ReturnType<typeof loginRequest>
): SagaIterator {
  try {
    const authAPI: AuthChannels = yield getContext('authAPI')
    const res = (yield call(authAPI.login, {
      username: action.payload.username,
      password: action.payload.password,
    })) as ReturnTypeAsync<typeof authAPI.login>
    if (isFailed(res)) {
      yield put(loginError(res.error.message))
    } else {
      yield put(loginSuccess(action.payload.username))
    }
  } catch (err) {
    yield put(loginError('An unknown error occured.'))
  }
}

export function* handleLogout(): SagaIterator {
  try {
    const authAPI: AuthChannels = yield getContext('authAPI')
    const res = (yield call(authAPI.logout)) as ReturnTypeAsync<
      typeof authAPI.logout
    >
    if (isFailed(res)) {
      yield put(logoutError(res.error.message))
    } else {
      yield put(logoutSuccess())
    }
  } catch (err) {
    yield put(logoutError('An unknown error occured.'))
  }
}

export function* handleRefresh(): SagaIterator {
  try {
    const authAPI: AuthChannels = yield getContext('authAPI')
    const res = (yield call(authAPI.refresh)) as ReturnTypeAsync<
      typeof authAPI.refresh
    >
    if (isFailed(res)) {
      yield put(refreshError(res.error.message))
    } else {
      yield put(refreshSuccess())
    }
  } catch (err) {
    yield put(refreshError('An unknown error occured.'))
  }
}

export function* handleChangePassword(
  action: ReturnType<typeof changePasswordRequest>
): SagaIterator {
  try {
    const authAPI: AuthChannels = yield getContext('authAPI')
    const res = (yield call(authAPI.changePassword, {
      oldPassword: action.payload.oldPassword,
      newPassword: action.payload.newPassword,
    })) as ReturnTypeAsync<typeof authAPI.refresh>
    if (isFailed(res)) {
      yield put(changePasswordError(res.error.message))
    } else {
      yield put(changePasswordSuccess())
    }
  } catch (err) {
    yield put(changePasswordError('An unknown error occured.'))
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
