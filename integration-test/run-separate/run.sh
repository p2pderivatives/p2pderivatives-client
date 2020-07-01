#!/bin/bash

set -e

for i in {1..15}
do
  docker-compose up -d bitcoind
  jest --config jest.config.integration-separate.js --reporters=default --runInBand ./integration-test/run-separate/dlcEventHandler.integration.test.ts -t=" $i-"
  docker-compose down --volumes
done
