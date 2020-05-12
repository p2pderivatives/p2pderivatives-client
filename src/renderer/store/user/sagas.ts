import { all, call, fork, put, takeEvery, getContext } from 'redux-saga/effects'
import { UserActionTypes } from './types'
import {
  registerError,
  registerSuccess,
  registerRequest,
  unregisterRequest,
  unregisterSuccess,
  unregisterError,
  userListSuccess,
  userListError,
} from './actions'
import { UserAPI } from '../../ipc/UserAPI'
import { IPCError } from '../../../common/models/ipc/IPCError'
import { AUTH_ERROR } from '../../../common/constants/Errors'
import { push } from 'connected-react-router'
import { SagaIterator } from 'redux-saga'

function* handleRegistration(
  action: ReturnType<typeof registerRequest>
): SagaIterator {
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

function* handleUnregistration(
  action: ReturnType<typeof unregisterRequest>
): SagaIterator {
  try {
    const userAPI: UserAPI = yield getContext('userAPI')

    yield call(userAPI.unregisterUser)
    yield put(unregisterSuccess())
  } catch (err) {
    if (err instanceof IPCError && (err as IPCError).getType() === AUTH_ERROR) {
      yield put(push('/'))
    } else if (err instanceof Error && err.message) {
      yield put(unregisterError(err.message))
    } else {
      yield put(unregisterError('An unknown error occured.'))
    }
  }
}

function* handleUserList(): SagaIterator {
  try {
    const userAPI: UserAPI = yield getContext('userAPI')

    const users = yield call(userAPI.getUserList)
    yield put(userListSuccess(users))
  } catch (err) {
    if (err instanceof IPCError && (err as IPCError).getType() === AUTH_ERROR) {
      yield put(push('/'))
    } else if (err instanceof Error && err.message) {
      yield put(userListError(err.message))
    } else {
      yield put(userListError('An unknown error occured.'))
    }
  }
}

function* watchRequests(): SagaIterator {
  yield takeEvery(UserActionTypes.REGISTRATION_REQUEST, handleRegistration)
  yield takeEvery(UserActionTypes.UNREGISTRATION_REQUEST, handleUnregistration)
  yield takeEvery(UserActionTypes.USERLIST_REQUEST, handleUserList)
}

function* userSagas(): SagaIterator {
  yield all([fork(watchRequests)])
}

export default userSagas
