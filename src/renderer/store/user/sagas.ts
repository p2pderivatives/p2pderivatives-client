import { push } from 'connected-react-router'
import { SagaIterator } from 'redux-saga'
import { all, call, fork, getContext, put, takeEvery } from 'redux-saga/effects'
import { AUTH_ERROR } from '../../../common/constants/Errors'
import { UserChannels } from '../../../common/ipc/model/user'
import { isFailed } from '../../../common/utils/failable'
import { ReturnTypeAsync } from '../../../common/utils/types'
import {
  registerError,
  registerRequest,
  registerSuccess,
  unregisterError,
  unregisterRequest,
  unregisterSuccess,
  userListError,
  userListSuccess,
} from './actions'
import { UserActionTypes } from './types'

function* handleRegistration(
  action: ReturnType<typeof registerRequest>
): SagaIterator {
  try {
    const userAPI: UserChannels = yield getContext('userAPI')
    const res = (yield call(userAPI.register, {
      username: action.payload.username,
      password: action.payload.password,
    })) as ReturnTypeAsync<typeof userAPI.register>
    if (isFailed(res)) {
      yield put(registerError(res.error.message))
    } else {
      yield put(registerSuccess())
    }
  } catch (err) {
    yield put(registerError('An unknown error occured.'))
  }
}

function* handleUnregistration(
  action: ReturnType<typeof unregisterRequest>
): SagaIterator {
  try {
    const userAPI: UserChannels = yield getContext('userAPI')
    const res = (yield call(userAPI.unregister)) as ReturnTypeAsync<
      typeof userAPI.unregister
    >
    if (isFailed(res)) {
      if (res.error.type === AUTH_ERROR) {
        yield put(push('/'))
      } else {
        yield put(unregisterError(res.error.message))
      }
    } else {
      yield put(unregisterSuccess())
    }
  } catch (err) {
    yield put(unregisterError('An unknown error occured.'))
  }
}

function* handleUserList(): SagaIterator {
  try {
    const userAPI: UserChannels = yield getContext('userAPI')

    const res = (yield call(userAPI.getAllUsers)) as ReturnTypeAsync<
      typeof userAPI.getAllUsers
    >
    if (isFailed(res)) {
      if (res.error.type === AUTH_ERROR) {
        yield put(push('/'))
      } else {
        yield put(userListError(res.error.message))
      }
    } else {
      yield put(userListSuccess(res.value))
    }
  } catch (err) {
    yield put(userListError('An unknown error occured.'))
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
