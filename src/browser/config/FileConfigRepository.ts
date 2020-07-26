import electron from 'electron'
import { promises as fs } from 'fs'
import yaml from 'js-yaml'
import path from 'path'
import { BitcoinDConfig } from '../../common/models/bitcoind/config'
import { Failable } from '../../common/utils/failable'
import { ErrorCode } from '../storage/ErrorCode'
import { RepositoryError } from '../storage/RepositoryError'
import ConfigRepository from './ConfigRepository'

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
      const config: BitcoinDConfig = yaml.safeLoad(file)
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
