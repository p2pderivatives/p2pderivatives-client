import electron from 'electron'
import path from 'path'
import { promises as fs } from 'fs'
import yaml from 'js-yaml'

import ConfigRepository from './ConfigRepository'
import { BitcoinDConfig } from '../../common/models/ipc/BitcoinDConfig'
import { RepositoryResult } from '../storage/RepositoryResult'
import { RepositoryError } from '../storage/RepositoryError'
import { ErrorCode } from '../storage/ErrorCode'

export default class FileConfigRepository implements ConfigRepository {
  private readonly userDataDir = electron.app.getPath('userData')
  private readonly bitcoinDPath = path.join(this.userDataDir, 'bitcoind.yaml')

  public WriteBitcoinDConfig(config: BitcoinDConfig): Promise<void> {
    return fs.writeFile(this.bitcoinDPath, yaml.safeDump(config))
  }

  public async ReadBitcoinDConfig(): Promise<RepositoryResult<BitcoinDConfig>> {
    try {
      const file = await fs.readFile(this.bitcoinDPath, 'utf-8')
      const config: BitcoinDConfig = yaml.safeLoad(file)
      return new RepositoryResult(config)
    } catch {
      return new RepositoryResult<BitcoinDConfig>(undefined, {
        errorCode: ErrorCode.NotFound,
      } as RepositoryError)
    }
  }
}
