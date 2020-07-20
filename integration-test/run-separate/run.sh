#!/bin/bash

set -e

for i in {1..22}
do
  docker-compose up -d bitcoind
  jest --config jest.config.integration-separate.js --reporters=default --runInBand -t=" $i-"
  docker-compose down --volumes
done
