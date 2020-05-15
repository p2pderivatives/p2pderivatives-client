import { all, call, fork, put, takeEvery, getContext } from 'redux-saga/effects'
import { FileActionTypes } from './types'
import { outcomeRequest, outcomeError, outcomeSuccess } from './actions'
import { FileAPI } from '../../ipc/FileAPI'
import { SagaIterator } from 'redux-saga'
import { IPCError } from '../../../common/models/ipc/IPCError'

export function* handleOutcomes(
  action: ReturnType<typeof outcomeRequest>
): SagaIterator {
  try {
    const fileAPI: FileAPI = yield getContext('fileAPI')
    const outcomeList = yield call(fileAPI.parseOutcomes, action.payload)
    yield put(outcomeSuccess(outcomeList))
  } catch (err) {
    if (err instanceof IPCError && err.getMessage()) {
      yield put(outcomeError(err.getMessage()))
    } else {
      yield put(outcomeError('An unknown error occured.'))
    }
  }
}

function* watchRequests(): SagaIterator {
  yield takeEvery(FileActionTypes.OUTCOME_REQUEST, handleOutcomes)
}

function* fileSagas(): SagaIterator {
  yield all([fork(watchRequests)])
}

export default fileSagas
