# P2PDerivatives

![](./src/renderer/assets/P2P_Logo_RGB_Yoko.png)

P2PDerivatives is an application that enables users to enter into Discreet Log Contracts with each others.

Features include:

- Offering a contract to a peer
- Accepting or rejecting a contract
- Automatic contract settlement at maturity

The application is in a very beta stage, _DO NOT TRY TO USE IT ON MAINNET_.

## Usage

Before using the application, make sure to read the [terms and conditions](./docs/Legal.md).

The application currently uses a server to enable communication between peers, as well as an oracle server to provide with information on trading price and signatures.
To make it easier for people to test it, we made instances of these servers available for anybody to use.
If you prefer, you can run the servers yourself.
You will also need to connect the application to a running bitcoind instance.

### Through CryptoGarage server

The easiest way to try out the application is by using the CryptoGarage server.
First download the latest release of the application [here](https://github.com/p2pderivatives/p2pderivatives-client/releases):
- for Windows download the `.exe` file
- for MacOS download the `.dmg` file (see [note](#note-for-macos-users))
- for Linux users download the `.AppImage` file

Then follow the [instructions to setup a bitcoind instance](#setting-up-bitcoind).

#### Note for MacOS users

To run a second instance of the application on MacOS:
- Press `⌘ + space`, type "terminal" and press `return`
- type `open -n /Applications/P2PD\ client.app/`

### Running your own servers

For testing locally, you can use the docker images available in this repository.  
If you do not wish to use docker, you can visit the repositories for [the communication server](https://github.com/p2pderivatives/p2pderivatives-server) and [the oracle server](https://github.com/p2pderivatives/p2pderivatives-oracle) to find out how to build their binaries locally.

Assuming docker and docker-compose are installed, simply run:

```
docker-compose up
```

This will also spin a bitcoind instance on regtest with the following credentials:
- rpcuser: `testuser`
- rpcpass: `lq6zequb-gYTdF2_ZEUtr8ywTXzLYtknzWU4nV8uVoo=`

You can then create two wallets and generate funds for them using the following command:
```
docker-compose exec --user bitcoin bitcoind /bin/sh /scripts/bitcoin-setup.sh
```

You can then use them in the application with the following info:
First wallet:
- username: `alice`
- password: `alice`
Second wallet:
- username: `bob`
- password: `bob`

If you wish instead to use your own bitcoind instance, you can run:

```
docker-compose up server server-db oracle oracle-db
```

and then follow the [instructions to setup a bitcoind instance](#setting-up-bitcoind).

To use the application with a locally deployed server and oracle, you have three choices:
- [use the distributed binaries](#using-distributed-binaries),
- [build a binary yourself](#building-a-binary-by-yourself),
- [run directly with electron](#run-with-electron-directly). 

#### Using distributed binaries

_Unfortunately there is no easy way to follow this approach for Linux users._
_Instead try [building a binary](#Building-a-binary-by-yourself) or [running with electron directly](#Run-with-electron-directly)._

Follow [these instructions](#Through-CryptoGarage-server) to download the appropriate binary for your platform.
Replace the configuration file `settings.default.yml` with [this one](./settings.default.yml).
The configuration file is located at: 
- `/Applications/P2PD\ client.app/settings.default.yml` on MacOS,
- `C:\Users\USERNAME\AppData\Local\Programs\p2pderivatives-client\settings.default.yml` on Windows (replace `USERNAME` with your windows user name).

#### Building a binary by yourself

Building a binary by yourself requires having npm installed on your machine.

Replace [`settings.production.yml`](./settings.production.yml) with [`settings.default.yml`](./settings.default.yml) (e.g. `cp settings.default.yml settings.production.yml`).

Run `npm run dist`.

#### Run with electron directly

Run:
```
npm install
npm run electron-dev
```

You can run a second instance of the application using (after having the first one running):
```
npm run electron-dev-simple
```

### Setting up bitcoind

You can download bitcoin core software [here](https://bitcoin.org/en/download).
There are other ways to install or download it depending on your operating system, which can be found easily on any search engine.

Once bitcoin-core is installed, you can use the scripts on this repository to start a node and create some wallets for testing.

(Note that these are bash scripts and will thus not work on a windows shell.
If using windows, you might be able to use them with git bash, but this is currently untested.)

Start by creating a folder somewhere on your computer and call it `p2pderivatives` (or whatever you prefer), and a sub-folder `scripts`.
Copy the content of the `./scripts` folder on this repository to the `scripts` folder you just created.

Note that the scripts will start bitcoind with following credentials:
- rpcuser: `user`
- rpcpassword: `pass`

#### Regtest

An easy way to test the application is to run a node in regtest.
`cd` into the `scripts` folder you created, and run `./start_bitcoind.sh`.

#### Testnet

To start a bitcoind instance on testnet, `cd` into the `scripts` folder you created and run `BITCOIN_NET=testnet ./start_bitcoind.sh`.

#### Creating a wallet

You can either use the main wallet of bitcoind, or create a separate wallet (which is handy if you want to play around with two users on the same computer).
To create a wallet, you can use the `createwallet` command of the `bitcoin-cli`.
For example, from within the scripts folder:

```
bitcoin-cli -datadir=./bitcoind -conf="bitcoin.regtest.conf" createwallet "alice" "false" "false" "str0nGP@ssw9rd"
```

#### Generate blocks in regtest

For the contract to be settled, you will have to generate blocks on regtest.
You can do so with the following command (assuming that you have created a wallet named `alice` previously):

```
bitcoin-cli -datadir=./bitcoind -conf=bitcoin.regtest.conf generatetoaddress 9 $(bitcoin-cli -datadir=./bitcoind -conf=bitcoin.regtest.conf -rpcwallet=alice getnewaddress)
```

Replace the number `9` with the number of block you wish to generate (you need to generate at least 6 blocks for the contract to be considered published).

## Contributing

Contributions are welcome.
Have a look at the [contributing guidelines](./docs/Contributing.md) and [development document](./docs/Development.md) if you have interest.

## Known limitations

- The application uses the `lockunspent` rpc call of the bitcoind wallet to make sure that UTXOs are not reused across offered contracts. However, [as stated in the documentation](https://bitcoincore.org/en/doc/0.20.0/rpc/wallet/lockunspent/), the bitcoind wallet only keeps the locked transaction into memory. This means that if the wallet is restarted while a contract is in the offer state (the fund transaction is not broadcast yet), when creating a new contract, it is possible that the previously allocated UTXOs will be reused, making one of the contract invalid.
- It is currently not possible to abort a contract once it has been offered meaning UTXOs will be locked until the contract is accepted or rejected by the counter party.
- A lot of bugs are probably waiting to be found!
