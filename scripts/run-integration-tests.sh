#!/bin/bash -euC

./scripts/run-bitcoind.sh
jest --config jest.config.integration.js -t 'mutual closing'
./scripts/stop-bitcoind.sh
