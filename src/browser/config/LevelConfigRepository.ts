import { LevelUp } from 'levelup'
import ConfigRepository from './ConfigRepository'
import { BitcoinDConfig } from '../../common/models/ipc/BitcoinDConfig'
import { getKeyPrefix, KeyPrefix } from '../storage/KeyPrefix'
import { getRepositoryResult } from '../storage/LevelUtils'
import { RepositoryError } from '../storage/RepositoryError'
import { Failable } from '../../common/utils/failable'

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
      getKeyPrefix(KeyPrefix.CONFIG) + configKey.toString().padStart(2, '0')
    )
  }

  WriteBitcoinDConfig(config: BitcoinDConfig): Promise<void> {
    const key = this.GetKey(ConfigKey.BitcoinDConfigKey)
    return this._db.put(key, config)
  }

  ReadBitcoinDConfig(): Promise<Failable<BitcoinDConfig, RepositoryError>> {
    const key = this.GetKey(ConfigKey.BitcoinDConfigKey)
    return getRepositoryResult<BitcoinDConfig>(this._db, key)
  }
}
