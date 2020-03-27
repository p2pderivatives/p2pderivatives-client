import { BitcoinDConfig } from '../../common/models/ipc/BitcoinDConfig'

export default interface Storage {
  writeBitcoinDConfig(config: BitcoinDConfig): void
  readBitcoinDConfig(): BitcoinDConfig | null
}
