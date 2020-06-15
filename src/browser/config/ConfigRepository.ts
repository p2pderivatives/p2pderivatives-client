import { BitcoinDConfig } from '../../common/models/ipc/BitcoinDConfig'
import { Failable } from '../../common/utils/failable'
import { RepositoryError } from '../storage/RepositoryError'

export default interface ConfigRepository {
  WriteBitcoinDConfig(config: BitcoinDConfig): Promise<void>
  ReadBitcoinDConfig(): Promise<Failable<BitcoinDConfig, RepositoryError>>
}
