docker-compose exec --user bitcoin bitcoind /bin/sh /scripts/migration.sh
docker-compose exec server /bin/sh /scripts/migration.sh