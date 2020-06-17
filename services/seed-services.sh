docker-compose exec --user bitcoin bitcoind /bin/sh /scripts/bitcoin-setup.sh
docker-compose exec server /bin/sh /scripts/db-seed.sh
