import { BitcoinDConfig } from '../../common/models/ipc/BitcoinDConfig'
import { RepositoryResult } from '../storage/RepositoryResult'

export default interface ConfigRepository {
  WriteBitcoinDConfig(config: BitcoinDConfig): Promise<void>
  ReadBitcoinDConfig(): Promise<RepositoryResult<BitcoinDConfig>>
}
