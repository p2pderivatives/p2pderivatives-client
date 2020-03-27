import { BitcoinDConfig } from '../../common/models/ipc/BitcoinDConfig'

export interface BitcoinAPI {
  checkConfig(config: BitcoinDConfig): Promise<void>
  getBalance(): Promise<number>
  getConfig(): Promise<BitcoinDConfig>
}
