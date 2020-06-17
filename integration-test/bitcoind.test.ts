import { TEST_BITCOIND_CONFIG, TEST_VECTORS } from '../services/bitcoind/env'
import BitcoinDClient from '../src/browser/api/bitcoind'
import { BitcoinDConfig } from '../src/common/models/ipc/BitcoinDConfig'

const defaultWalletConfig: Readonly<BitcoinDConfig> = {
  rpcUsername: TEST_BITCOIND_CONFIG.rpcUsername,
  rpcPassword: TEST_BITCOIND_CONFIG.rpcPassword,
  network: TEST_BITCOIND_CONFIG.network,
  host: TEST_BITCOIND_CONFIG.host,
  port: TEST_BITCOIND_CONFIG.port,
}

const walletConfig: Readonly<BitcoinDConfig> = {
  ...defaultWalletConfig,
  wallet: TEST_BITCOIND_CONFIG.wallet,
  walletPassphrase: TEST_BITCOIND_CONFIG.walletPassphrase,
}

describe('bitcoind', () => {
  let client: BitcoinDClient

  beforeAll(async () => {
    client = new BitcoinDClient()
  })

  test('can-load-default-wallet', async () => {
    await expect(client.configure(defaultWalletConfig)).resolves.not.toThrow()
  })

  test('can-get-default-balance', async () => {
    await client.configure(defaultWalletConfig)
    await expect(client.getBalance()).resolves.toBeGreaterThanOrEqual(0)
  })

  test('loading-non-existing-wallet-fails', async () => {
    await expect(
      client.configure({
        ...defaultWalletConfig,
        wallet: 'does-not-exist',
      })
    ).rejects.toThrow()
  })

  test('can-load-other-wallet', async () => {
    await client.configure(walletConfig)
    await expect(client.getBalance()).resolves.toBeGreaterThanOrEqual(0)
  })

  test('can-get-raw-transaction', async () => {
    await client.configure(walletConfig)
    const tx = await client.getTransaction(TEST_VECTORS.testTx.id)
    expect(tx.confirmations).toBeGreaterThanOrEqual(0)
    expect(tx.amount).toBe(-TEST_VECTORS.testTx.amount)
  })

  test('can-generate-new-address', async () => {
    await client.configure(walletConfig)
    await expect(client.getNewAddress()).resolves.toBeDefined()
  })

  test('can-get-privkey', async () => {
    await client.configure(walletConfig)
    const address = await client.getNewAddress()
    const privKey = await client.dumpPrivKey(address)
    expect(privKey).toBeDefined()
  })
})
