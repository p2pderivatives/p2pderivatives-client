import { all, call, fork, put, takeEvery, getContext } from 'redux-saga/effects'
import { BitcoinActionTypes } from './types'
import {
  checkRequest,
  checkError,
  checkSuccess,
  balanceRequest,
  balanceSuccess,
  balanceError,
  configRequest,
  configRetrieved,
} from './actions'
import { BitcoinAPI } from '../../ipc/BitcoinAPI'

export function* handleCheck(action: ReturnType<typeof checkRequest>) {
  try {
    const bitcoinAPI: BitcoinAPI = yield getContext('bitcoinAPI')
    yield call(bitcoinAPI.checkConfig, action.payload)
    yield put(checkSuccess())
  } catch (err) {
    if (err instanceof Error && err.message) {
      yield put(checkError(err.message))
    } else {
      yield put(checkError('An unknown error occured.'))
    }
  }
}

export function* handleBalance(action: ReturnType<typeof balanceRequest>) {
  try {
    const bitcoinAPI: BitcoinAPI = yield getContext('bitcoinAPI')
    const balance = yield call(bitcoinAPI.getBalance)
    yield put(balanceSuccess(balance))
  } catch (err) {
    if (err instanceof Error && err.message) {
      yield put(balanceError(err.message))
    } else {
      yield put(balanceError('An unknown error occured.'))
    }
  }
}

export function* handleConfig(action: ReturnType<typeof configRequest>) {
  try {
    const bitcoinAPI: BitcoinAPI = yield getContext('bitcoinAPI')
    const config = yield call(bitcoinAPI.getConfig)
    yield put(configRetrieved(config))
  } catch (err) {
    // nothing to be done, no config loaded
  }
}

function* watchRequests() {
  yield takeEvery(BitcoinActionTypes.CHECK_REQUEST, handleCheck)
  yield takeEvery(BitcoinActionTypes.BALANCE_REQUEST, handleBalance)
  yield takeEvery(BitcoinActionTypes.CONFIG_REQUEST, handleConfig)
}

function* bitcoinSagas() {
  yield all([fork(watchRequests)])
}

export default bitcoinSagas
