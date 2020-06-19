import { all, call, fork, put, takeEvery, getContext } from 'redux-saga/effects'
import { DlcActionTypes } from './types'
import {
  contractError,
  contractSuccess,
  offerRequest,
  rejectRequest,
  dlcActionSuccess,
  dlcActionError,
  acceptRequest,
} from './actions'
import { SagaIterator } from 'redux-saga'
import { DlcRendererAPI } from '../../ipc/DlcRendererAPI'
import { IPCError } from '../../../common/models/ipc/IPCError'
import { DlcEventType } from '../../../common/constants/DlcEventType'
import { DlcAnswerProps } from '../../../common/models/ipc/DlcAnswer'

export function* handleContracts(): SagaIterator {
  try {
    const dlcAPI: DlcRendererAPI = yield getContext('dlcAPI')
    const contracts = yield call(dlcAPI.getContracts)
    yield put(contractSuccess(contracts))
  } catch (err) {
    if (err instanceof IPCError && err.getMessage()) {
      yield put(contractError(err.getMessage()))
    } else {
      yield put(contractError('An unknown error occured.'))
    }
  }
}

export function* handleOffer(
  action: ReturnType<typeof offerRequest>
): SagaIterator {
  try {
    const dlcAPI: DlcRendererAPI = yield getContext('dlcAPI')
    console.log('AJAJAJAJ')
    const answer = (yield call(
      dlcAPI.offerContract,
      action.payload
    )) as DlcAnswerProps
    console.log('AJAJAJAJ')
    console.log(answer)
    if (!answer._contract) {
      console.log('A')
      throw answer._error
    }
    if (!answer._success && answer._contract && answer._error) {
      console.log('B')
      yield put(
        dlcActionError({
          error: answer._error._message,
          contract: answer._contract,
        })
      )
    } else {
      console.log('C')
      yield put(dlcActionSuccess(answer._contract))
    }
  } catch (err) {
    console.log('GOT ERROR:')
    console.log(err)
    if (err instanceof IPCError && err.getMessage()) {
      yield put(dlcActionError({ error: err.getMessage() }))
    } else {
      yield put(dlcActionError({ error: 'An unknown error occured.' }))
    }
  }
}

export function* handleAccept(
  action: ReturnType<typeof acceptRequest>
): SagaIterator {
  try {
    const dlcAPI: DlcRendererAPI = yield getContext('dlcAPI')
    const answer = (yield call(
      dlcAPI.dlcCall,
      DlcEventType.Accept,
      action.payload
    )) as DlcAnswerProps
    if (!answer._success || !answer._contract) {
      throw answer._error
    }
    yield put(dlcActionSuccess(answer._contract))
  } catch (err) {
    if (err instanceof IPCError && err.getMessage()) {
      yield put(dlcActionError({ error: err.getMessage() }))
    } else {
      yield put(dlcActionError({ error: 'An unknown error occured.' }))
    }
  }
}

export function* handleReject(
  action: ReturnType<typeof rejectRequest>
): SagaIterator {
  try {
    const dlcAPI: DlcRendererAPI = yield getContext('dlcAPI')
    const answer = (yield call(
      dlcAPI.dlcCall,
      DlcEventType.Reject,
      action.payload
    )) as DlcAnswerProps
    if (!answer._success || !answer._contract) {
      throw answer._error
    }
    yield put(dlcActionSuccess(answer._contract))
  } catch (err) {
    if (err instanceof IPCError && err.getMessage()) {
      yield put(dlcActionError({ error: err.getMessage() }))
    } else {
      yield put(dlcActionError({ error: 'An unknown error occured.' }))
    }
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
