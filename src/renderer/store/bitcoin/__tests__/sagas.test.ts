import { expectSaga } from 'redux-saga-test-plan'
import { getContext } from 'redux-saga/effects'
import {
  BitcoindChannels,
  BitcoindFailableAsync,
} from '../../../../common/ipc/model/bitcoind'
import { BitcoinDConfig } from '../../../../common/models/bitcoind/config'
import { Success } from '../../../../common/utils/failable'
import {
  balanceRequest,
  balanceSuccess,
  checkError,
  checkRequest,
  checkSuccess,
  configRequest,
  configRetrieved,
} from '../actions'
import bitcoinSagas from '../sagas'

const mockError = {
  success: false,
  error: {
    type: 'bitcoind',
    code: 1,
    message: 'test message',
    name: 'test name',
  },
} as const

class MockAuthAPI implements BitcoindChannels {
  getBalance(): BitcoindFailableAsync<number> {
    return Promise.resolve(Success(1.5))
  }
  checkConfig(data: BitcoinDConfig): BitcoindFailableAsync<void> {
    if (!data.host) {
      return Promise.resolve(Success())
    } else {
      return Promise.resolve(mockError)
    }
  }
  getConfig(): BitcoindFailableAsync<BitcoinDConfig> {
    return Promise.resolve(Success({ network: 'regtest', wallet: 'test' }))
  }
  getUtxoAmount(): BitcoindFailableAsync<number> {
    throw new Error('Method not implemented.')
  }
}

describe('bitcoin saga', () => {
  const bitcoinAPI = new MockAuthAPI()

  it('should handle a test successfully', () => {
    return expectSaga(bitcoinSagas)
      .provide([[getContext('bitcoinAPI'), bitcoinAPI]])
      .put(checkSuccess())
      .dispatch(checkRequest({}))
      .run()
  })

  it('should handle bad config', () => {
    return expectSaga(bitcoinSagas)
      .provide([[getContext('bitcoinAPI'), bitcoinAPI]])
      .put(checkError(mockError.error.message))
      .dispatch(checkRequest({ host: 'notlocalhost' }))
      .run()
  })

  it('should get balance successfully', () => {
    return expectSaga(bitcoinSagas)
      .provide([[getContext('bitcoinAPI'), bitcoinAPI]])
      .put(balanceSuccess(1.5))
      .dispatch(balanceRequest())
      .run()
  })

  it('should get config successfully', () => {
    return expectSaga(bitcoinSagas)
      .provide([[getContext('bitcoinAPI'), bitcoinAPI]])
      .put(configRetrieved({ network: 'regtest', wallet: 'test' }))
      .dispatch(configRequest())
      .run()
  })
})
