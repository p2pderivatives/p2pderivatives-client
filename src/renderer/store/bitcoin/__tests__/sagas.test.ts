import { expectSaga } from 'redux-saga-test-plan'
import bitcoinSagas from '../sagas'
import { BitcoinAPI } from '../../../ipc/BitcoinAPI'
import { BitcoinDConfig } from '../../../../common/models/ipc/BitcoinDConfig'
import {
  checkSuccess,
  checkRequest,
  checkError,
  balanceRequest,
  balanceSuccess,
  configRequest,
  configRetrieved,
} from '../actions'
import { getContext } from 'redux-saga/effects'
import { IPCError } from '../../../../common/models/ipc/IPCError'

class MockAuthAPI implements BitcoinAPI {
  getConfig(): Promise<BitcoinDConfig> {
    return new Promise((resolve, reject) => {
      const config: BitcoinDConfig = { network: 'regtest', wallet: 'test' }
      resolve(config)
    })
  }
  checkConfig(config: BitcoinDConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!config.host) {
        resolve()
      } else {
        throw new IPCError('general', -1, 'test error', 'test_error')
      }
    })
  }
  getBalance(): Promise<number> {
    return new Promise((resolve, reject) => {
      resolve(1.5)
    })
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
      .put(checkError('test error'))
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
