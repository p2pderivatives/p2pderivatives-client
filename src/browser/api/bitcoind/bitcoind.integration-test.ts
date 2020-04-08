import BitcoinDClient from './'

const RPC_USER = 'testuser'
const RPC_PASSWORD = 'testpassword'
const NETWORK = 'regtest'
const PORT = 18443
const WALLET = 'test'
const WALLETPASSPHRASE = 'test123!'

const client = new BitcoinDClient()

describe('bitcoind-tests', () => {
  test('can-load-default-wallet', async done => {
    await client.configure({
      rpcUsername: RPC_USER,
      rpcPassword: RPC_PASSWORD,
      network: NETWORK,
      port: PORT,
    })
    done()
    // no assertion needed, as long as no exception is thrown
  })

  test('can-get-default-balance', async () => {
    await client.configure({
      rpcUsername: RPC_USER,
      rpcPassword: RPC_PASSWORD,
      network: NETWORK,
      port: PORT,
    })
    const balance = await client.getBalance()
    expect(balance).toBeGreaterThanOrEqual(0)
  })

  test('loading-non-existing-wallet-fails', async () => {
    let error
    try {
      await client.configure({
        rpcUsername: RPC_USER,
        rpcPassword: RPC_PASSWORD,
        network: NETWORK,
        port: PORT,
        wallet: 'does-not-exist',
      })
    } catch (e) {
      error = e
    }
    expect(error.code).toEqual(-18)
  })

  test('can-load-other-wallet', async () => {
    await client.configure({
      rpcUsername: RPC_USER,
      rpcPassword: RPC_PASSWORD,
      network: NETWORK,
      port: PORT,
      wallet: WALLET,
      walletPassphrase: WALLETPASSPHRASE,
    })
    const balance = await client.getBalance()
    expect(balance).toBeGreaterThanOrEqual(0)
  })

  test('can-get-raw-transaction', async () => {
    await client.configure({
      rpcUsername: RPC_USER,
      rpcPassword: RPC_PASSWORD,
      network: NETWORK,
      port: PORT,
      wallet: WALLET,
      walletPassphrase: WALLETPASSPHRASE,
    })
    const tx = await client.getTransaction(
      '4c361a02cdcc257f44dbfb24b93f19c7b3c21cba3d1b15dab8e3f70a832c191e'
    )
    expect(tx.confirmations).toBeGreaterThanOrEqual(0)
    expect(tx.amount).toBe(-1)
  })

  test('can-generate-new-address', async () => {
    await client.configure({
      rpcUsername: RPC_USER,
      rpcPassword: RPC_PASSWORD,
      network: NETWORK,
      port: PORT,
      wallet: WALLET,
      walletPassphrase: WALLETPASSPHRASE,
    })
    const address = await client.getNewAddress()
    expect(address).toBeDefined()
  })

  test('can-get-privkey', async () => {
    await client.configure({
      rpcUsername: RPC_USER,
      rpcPassword: RPC_PASSWORD,
      network: NETWORK,
      port: PORT,
      wallet: WALLET,
      walletPassphrase: WALLETPASSPHRASE,
    })
    const address = await client.getNewAddress()
    const privKey = await client.dumpPrivKey(address)
    expect(privKey).toBeDefined()
  })
})
