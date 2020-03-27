import electron from 'electron'
import path from 'path'
import * as fs from 'fs'
import yaml from 'js-yaml'

import Storage from './storage'
import { BitcoinDConfig } from '../../common/models/ipc/BitcoinDConfig'

export default class FileStorage implements Storage {
  private readonly userDataDir = electron.app.getPath('userData')
  private readonly bitcoinDPath = path.join(this.userDataDir, 'bitcoind.yaml')

  public writeBitcoinDConfig(config: BitcoinDConfig): void {
    fs.writeFileSync(this.bitcoinDPath, yaml.safeDump(config))
  }

  public readBitcoinDConfig(): BitcoinDConfig | null {
    if (fs.existsSync(this.bitcoinDPath)) {
      const config: BitcoinDConfig = yaml.safeLoad(
        fs.readFileSync(this.bitcoinDPath, 'utf-8')
      )
      return config
    } else {
      return null
    }
  }
}
