import { BITCOIND_ERROR } from '../../constants/Errors'
import { BitcoinDConfig } from '../../models/bitcoind/config'
import { FailableAsync } from '../../utils/failable'
import { ConstrainEvents, ErrorIPC } from '../IPC'

interface BitcoindIPCError extends ErrorIPC {
  type: typeof BITCOIND_ERROR
}

export const BITCOIND_TAGS = {
  getBalance: 'bitcoind/balance/get',
  checkConfig: 'bitcoind/config/check',
  getConfig: 'bitcoind/config/get',
  getUtxoAmount: 'bitcoind/utxo/get',
} as const

type TAGS_TYPE = typeof BITCOIND_TAGS
export type BitcoindFailableAsync<T> = FailableAsync<T, BitcoindIPCError>

export interface BitcoindChannels
  extends ConstrainEvents<TAGS_TYPE, BitcoindChannels> {
  getBalance(): BitcoindFailableAsync<number>
  checkConfig(data: BitcoinDConfig): BitcoindFailableAsync<void>
  getConfig(): BitcoindFailableAsync<BitcoinDConfig>
  getUtxoAmount(): BitcoindFailableAsync<number>
}

export type BITCOIND_TAGGED_EVENTS = [
  TAGS_TYPE,
  BitcoindChannels,
  BitcoindIPCError
]
