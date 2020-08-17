import { IPCEventsConsumer } from '../../../common/ipc/BaseIPC'
import {
  BitcoindChannels,
  BITCOIND_TAGS,
} from '../../../common/ipc/model/bitcoind'

export class BitcoinIPC extends IPCEventsConsumer<BitcoindChannels, 'main'> {
  constructor() {
    super('main', BITCOIND_TAGS)
  }
}
