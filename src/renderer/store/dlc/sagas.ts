import { SagaIterator } from 'redux-saga'
import { all, call, fork, getContext, put, takeEvery } from 'redux-saga/effects'
import { DlcEventType } from '../../../common/constants/DlcEventType'
import { DlcChannels } from '../../../common/ipc/model/dlc'
import { isFailed } from '../../../common/utils/failable'
import { ReturnTypeAsync } from '../../../common/utils/types'
import {
  acceptRequest,
  contractError,
  contractSuccess,
  dlcActionError,
  dlcActionSuccess,
  offerRequest,
  rejectRequest,
} from './actions'
import { DlcActionTypes } from './types'

export function* handleContracts(): SagaIterator {
  try {
    const dlcAPI: DlcChannels = yield getContext('dlcAPI')
    const res = (yield call(dlcAPI.getAllContracts)) as ReturnTypeAsync<
      typeof dlcAPI.getAllContracts
    >
    if (isFailed(res)) {
      yield put(contractError(res.error.message))
    } else {
      yield put(contractSuccess(res.value))
    }
  } catch (err) {
    yield put(contractError('An unknown error occured.'))
  }
}

export function* handleOffer(
  action: ReturnType<typeof offerRequest>
): SagaIterator {
  try {
    const dlcAPI: DlcChannels = yield getContext('dlcAPI')
    const res = (yield call(
      dlcAPI.offerContract,
      action.payload
    )) as ReturnTypeAsync<typeof dlcAPI.offerContract>
    if (isFailed(res)) {
      yield put(
        dlcActionError({
          error: res.error.message,
          contract: res.error.contract,
        })
      )
    } else {
      yield put(dlcActionSuccess(res.value))
    }
  } catch (err) {
    yield put(dlcActionError({ error: 'An unknown error occured.' }))
  }
}

export function* handleAccept(
  action: ReturnType<typeof acceptRequest>
): SagaIterator {
  try {
    const dlcAPI: DlcChannels = yield getContext('dlcAPI')
    const res = (yield call(dlcAPI.dlcCall, {
      type: DlcEventType.Accept,
      contractId: action.payload,
    })) as ReturnTypeAsync<typeof dlcAPI.dlcCall>
    if (isFailed(res)) {
      yield put(dlcActionError({ error: res.error.message }))
    } else {
      yield put(dlcActionSuccess(res.value))
    }
  } catch (err) {
    yield put(dlcActionError({ error: 'An unknown error occured.' }))
  }
}

export function* handleReject(
  action: ReturnType<typeof rejectRequest>
): SagaIterator {
  try {
    const dlcAPI: DlcChannels = yield getContext('dlcAPI')
    const res = (yield call(dlcAPI.dlcCall, {
      type: DlcEventType.Reject,
      contractId: action.payload,
    })) as ReturnTypeAsync<typeof dlcAPI.dlcCall>
    if (isFailed(res)) {
      yield put(dlcActionError({ error: res.error.message }))
    } else {
      yield put(dlcActionSuccess(res.value))
    }
  } catch (err) {
    yield put(dlcActionError({ error: 'An unknown error occured.' }))
  }
}

function* watchRequests(): SagaIterator {
  yield takeEvery(DlcActionTypes.CONTRACT_REQUEST, handleContracts)
  yield takeEvery(DlcActionTypes.ACCEPT_REQUEST, handleAccept)
  yield takeEvery(DlcActionTypes.OFFER_REQUEST, handleOffer)
  yield takeEvery(DlcActionTypes.REJECT_REQUEST, handleReject)
}

function* dlcSagas(): SagaIterator {
  yield all([fork(watchRequests)])
}

export default dlcSagas
