import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'
import { BitcoinDConfig } from '../../src/common/models/ipc/BitcoinDConfig'

export const TEST_BITCOIND_CONFIG: Readonly<Required<BitcoinDConfig>> = {
  host: process.env.BITCOIND_HOST || 'localhost',
  port: process.env.BITCOIND_PORT ? parseInt(process.env.BITCOIND_PORT) : 18443,
  sockProxy: '',
  network: 'regtest',
  rpcUsername: 'testuser',
  rpcPassword: 'lq6zequb-gYTdF2_ZEUtr8ywTXzLYtknzWU4nV8uVoo=',
  wallet: 'alice',
  walletPassphrase: 'alice',
}

interface TestVector {
  testTx: {
    id: string
    amount: number
  }
}

export const TEST_VECTORS: TestVector = load()

function load(): TestVector {
  try {
    return yaml.safeLoad(
      fs.readFileSync(path.resolve(__dirname, './vectors/vector.yml'), 'utf8')
    ) as TestVector
  } catch {
    return {
      testTx: {
        id: '',
        amount: 0,
      },
    }
  }
}
