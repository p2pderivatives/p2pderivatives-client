import { SagaIterator } from 'redux-saga'
import { all, call, fork, getContext, put, takeEvery } from 'redux-saga/effects'
import { BitcoindChannels } from '../../../common/ipc/model/bitcoind'
import { isFailed } from '../../../common/utils/failable'
import { ReturnTypeAsync } from '../../../common/utils/types'
import {
  balanceError,
  balanceRequest,
  balanceSuccess,
  checkError,
  checkRequest,
  checkSuccess,
  configNone,
  configRetrieved,
} from './actions'
import { BitcoinActionTypes } from './types'

export function* handleCheck(
  action: ReturnType<typeof checkRequest>
): SagaIterator {
  try {
    const bitcoinAPI: BitcoindChannels = yield getContext('bitcoinAPI')
    const res = (yield call(
      bitcoinAPI.checkConfig,
      action.payload
    )) as ReturnTypeAsync<typeof bitcoinAPI.checkConfig>
    if (isFailed(res)) {
      yield put(checkError(res.error.message))
    } else {
      yield put(checkSuccess())
    }
  } catch (err) {
    yield put(checkError('An unknown error occured.'))
  }
}

export function* handleBalance(
  action: ReturnType<typeof balanceRequest>
): SagaIterator {
  try {
    const bitcoinAPI: BitcoindChannels = yield getContext('bitcoinAPI')
    const res = (yield call(bitcoinAPI.getBalance)) as ReturnTypeAsync<
      typeof bitcoinAPI.getBalance
    >
    if (isFailed(res)) {
      yield put(checkError(res.error.message))
    } else {
      yield put(balanceSuccess(res.value))
    }
  } catch (err) {
    yield put(balanceError('An unknown error occured.'))
  }
}

export function* handleConfig(): SagaIterator {
  try {
    const bitcoinAPI: BitcoindChannels = yield getContext('bitcoinAPI')
    const res = (yield call(bitcoinAPI.getConfig)) as ReturnTypeAsync<
      typeof bitcoinAPI.getConfig
    >
    if (isFailed(res)) {
      // do nothing
    } else {
      yield put(configRetrieved(res.value))
    }
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
