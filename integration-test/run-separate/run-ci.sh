#!/bin/bash

set -e

for i in {1..16}
do
  docker-compose -f docker-compose.yml -f docker-compose.ci.yml up -d bitcoind
  npm run integration-separate-ci -- -t=" $i-"
  docker-compose down --volumes
done
