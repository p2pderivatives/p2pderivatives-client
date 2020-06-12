import { BitcoinDConfig } from '../../src/common/models/ipc/BitcoinDConfig'

export const TEST_BITCOIND_CONFIG: Readonly<Required<BitcoinDConfig>> = {
  host: 'localhost',
  port: 18443,
  network: 'regtest',
  rpcUsername: 'testuser',
  rpcPassword: 'lq6zequb-gYTdF2_ZEUtr8ywTXzLYtknzWU4nV8uVoo=',
  wallet: 'alice',
  walletPassphrase: 'alice',
}
