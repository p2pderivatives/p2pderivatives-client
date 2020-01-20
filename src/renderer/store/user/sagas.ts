import { all, call, fork, put, takeEvery, getContext } from 'redux-saga/effects'
import { UserActionTypes } from './types'
import {
  registerError,
  registerSuccess,
  registerRequest,
  unregisterRequest,
  unregisterSuccess,
  unregisterError,
} from './actions'
import { UserAPI } from '../../ipc/UserAPI'

function* handleRegistration(action: ReturnType<typeof registerRequest>) {
  try {
    const userAPI: UserAPI = yield getContext('userAPI')

    yield call(
      userAPI.registerUser,
      action.payload.password,
      action.payload.username
    )
    yield put(registerSuccess())
  } catch (err) {
    if (err instanceof Error && err.message) {
      yield put(registerError(err.message))
    } else {
      yield put(registerError('An unknown error occured.'))
    }
  }
}

function* handleUnregistration(action: ReturnType<typeof unregisterRequest>) {
  try {
    const userAPI: UserAPI = yield getContext('userAPI')

    yield call(userAPI.unregisterUser)
    yield put(unregisterSuccess())
  } catch (err) {
    if (err instanceof Error && err.message) {
      yield put(unregisterError(err.message))
    } else {
      yield put(unregisterError('An unknown error occured.'))
    }
  }
}

function* watchRequests() {
  yield takeEvery(UserActionTypes.REGISTRATION_REQUEST, handleRegistration)
  yield takeEvery(UserActionTypes.UNREGISTRATION_REQUEST, handleUnregistration)
}

function* userSagas() {
  yield all([fork(watchRequests)])
}

export default userSagas
