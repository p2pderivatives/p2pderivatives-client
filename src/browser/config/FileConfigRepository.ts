import electron from 'electron'
import path from 'path'
import { promises as fs } from 'fs'
import yaml from 'js-yaml'

import ConfigRepository from './ConfigRepository'
import { BitcoinDConfig } from '../../common/models/ipc/BitcoinDConfig'
import { RepositoryError } from '../storage/RepositoryError'
import { ErrorCode } from '../storage/ErrorCode'
import { Failable } from '../../common/utils/failable'

export default class FileConfigRepository implements ConfigRepository {
  private readonly userDataDir = electron.app.getPath('userData')
  private readonly bitcoinDPath = path.join(this.userDataDir, 'bitcoind.yaml')

  public WriteBitcoinDConfig(config: BitcoinDConfig): Promise<void> {
    return fs.writeFile(this.bitcoinDPath, yaml.safeDump(config))
  }

  public async ReadBitcoinDConfig(): Promise<
    Failable<BitcoinDConfig, RepositoryError>
  > {
    try {
      const file = await fs.readFile(this.bitcoinDPath, 'utf-8')
      const config: BitcoinDConfig = yaml.safeLoad(file) as BitcoinDConfig
      return {
        success: true,
        value: config,
      }
    } catch {
      return {
        success: false,
        error: new RepositoryError(
          ErrorCode.NotFound,
          'Config file not found.'
        ),
      }
    }
  }
}
