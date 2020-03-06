import BitcoinDClient from './'

const RPC_USER = 'testuser'
const RPC_PASSWORD = 'testpassword'
const NETWORK = 'regtest'
const PORT = 18443
const WALLET = 'test'
const WALLETPASSPHRASE = 'test123!'

const client = new BitcoinDClient()

test('can-load-default-wallet', async done => {
  await client.configure({
    rpcUser: RPC_USER,
    rpcPassword: RPC_PASSWORD,
    network: NETWORK,
    port: PORT,
  })
  done()
  // no assertion needed, as long as no exception is thrown
})

test('can-get-default-balance', async done => {
  await client.configure({
    rpcUser: RPC_USER,
    rpcPassword: RPC_PASSWORD,
    network: NETWORK,
    port: PORT,
  })
  const balance = await client.getBalance()
  expect(balance).toBe(0)
  done()
})

test('can-load-other-wallet', async done => {
  await client.configure({
    rpcUser: RPC_USER,
    rpcPassword: RPC_PASSWORD,
    network: NETWORK,
    port: PORT,
    wallet: WALLET,
    walletPassphrase: WALLETPASSPHRASE,
  })
  const balance = await client.getBalance()
  expect(balance).toBeGreaterThan(47) // arbitrary local value
  done()
})

test('can-get-raw-transaction', async done => {
  await client.configure({
    rpcUser: RPC_USER,
    rpcPassword: RPC_PASSWORD,
    network: NETWORK,
    port: PORT,
    wallet: WALLET,
    walletPassphrase: WALLETPASSPHRASE,
  })
  const tx = await client.getTransaction(
    '4c361a02cdcc257f44dbfb24b93f19c7b3c21cba3d1b15dab8e3f70a832c191e'
  )
  expect(tx.confirmations).toBe(0)
  expect(tx.amount).toBe(-1)
}, 200000)

test('can-generate-new-address', async done => {
  await client.configure({
    rpcUser: RPC_USER,
    rpcPassword: RPC_PASSWORD,
    network: NETWORK,
    port: PORT,
    wallet: WALLET,
    walletPassphrase: WALLETPASSPHRASE,
  })
  const address = await client.getNewAddress()
  expect(address).toBeDefined()
}, 20000)

test('can-get-privkey', async done => {
  await client.configure({
    rpcUser: RPC_USER,
    rpcPassword: RPC_PASSWORD,
    network: NETWORK,
    port: PORT,
    wallet: WALLET,
    walletPassphrase: WALLETPASSPHRASE,
  })
  const address = await client.getNewAddress()
  const privKey = await client.dumpPrivKey(address)
  console.log('privkey:', privKey)
  expect(privKey).toBeDefined()
}, 20000)
