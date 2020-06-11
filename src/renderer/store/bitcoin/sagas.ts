import { all, call, fork, put, takeEvery, getContext } from 'redux-saga/effects'
import { BitcoinActionTypes } from './types'
import {
  checkRequest,
  checkError,
  checkSuccess,
  balanceRequest,
  balanceSuccess,
  balanceError,
  configRetrieved,
  configNone,
} from './actions'
import { BitcoinAPI } from '../../ipc/BitcoinAPI'
import { IPCError } from '../../../common/models/ipc/IPCError'
import { SagaIterator } from 'redux-saga'

export function* handleCheck(
  action: ReturnType<typeof checkRequest>
): SagaIterator {
  try {
    const bitcoinAPI: BitcoinAPI = yield getContext('bitcoinAPI')
    yield call(bitcoinAPI.checkConfig, action.payload)
    yield put(checkSuccess())
  } catch (err) {
    if (err instanceof IPCError && err.getMessage()) {
      yield put(checkError(err.getMessage()))
    } else {
      yield put(checkError('An unknown error occured.'))
    }
  }
}

export function* handleBalance(
  action: ReturnType<typeof balanceRequest>
): SagaIterator {
  try {
    const bitcoinAPI: BitcoinAPI = yield getContext('bitcoinAPI')
    const balance = yield call(bitcoinAPI.getBalance)
    yield put(balanceSuccess(balance))
  } catch (err) {
    if (err instanceof IPCError && err.getMessage()) {
      yield put(balanceError(err.getMessage()))
    } else {
      yield put(balanceError('An unknown error occured.'))
    }
  }
}

export function* handleConfig(): SagaIterator {
  try {
    const bitcoinAPI: BitcoinAPI = yield getContext('bitcoinAPI')
    const config = yield call(bitcoinAPI.getConfig)
    yield put(configRetrieved(config))
  } catch (err) {
    yield put(configNone())
  }
}

function* watchRequests(): SagaIterator {
  yield takeEvery(BitcoinActionTypes.CHECK_REQUEST, handleCheck)
  yield takeEvery(BitcoinActionTypes.BALANCE_REQUEST, handleBalance)
  yield takeEvery(BitcoinActionTypes.CONFIG_REQUEST, handleConfig)
}

function* bitcoinSagas(): SagaIterator {
  yield all([fork(watchRequests)])
}

export default bitcoinSagas
