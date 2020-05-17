import { LevelUp } from 'levelup'
import ConfigRepository from './ConfigRepository'
import { BitcoinDConfig } from '../../common/models/ipc/BitcoinDConfig'
import { GetKeyPrefix, KeyPrefix } from '../storage/KeyPrefix'
import { GetRepositoryResult } from '../storage/LevelUtils'
import { RepositoryResult } from '../storage/RepositoryResult'

enum ConfigKey {
  BitcoinDConfigKey = 1,
}

export class LevelConfigRepository implements ConfigRepository {
  private readonly _db: LevelUp

  constructor(db: LevelUp) {
    this._db = db
  }

  private GetKey(configKey: ConfigKey): string {
    return (
      GetKeyPrefix(KeyPrefix.CONFIG) + configKey.toString().padStart(2, '0')
    )
  }

  WriteBitcoinDConfig(config: BitcoinDConfig): Promise<void> {
    const key = this.GetKey(ConfigKey.BitcoinDConfigKey)
    return this._db.put(key, config)
  }

  ReadBitcoinDConfig(): Promise<RepositoryResult<BitcoinDConfig>> {
    const key = this.GetKey(ConfigKey.BitcoinDConfigKey)
    return GetRepositoryResult<BitcoinDConfig>(this._db, key)
  }
}
