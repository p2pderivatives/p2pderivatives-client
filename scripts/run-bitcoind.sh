#!/bin/bash -euC

docker run --rm -it -d \
  --name bitcoind-p2pdclient \
  -p 18443:18443 \
  -p 18444:18444 \
  ruimarinho/bitcoin-core \
  -printtoconsole \
  -regtest=1 \
  -rpcallowip=172.17.0.0/16 \
  -rpcbind=0.0.0.0 \
  -rpcauth='testuser:d02062bf24af3c364229716eb88dba49$0cbf2910cc79f40ecc8ead58ead54c7ebaf6ab63d1e3636cf6454409ffda9241' \
  -addresstype='bech32'