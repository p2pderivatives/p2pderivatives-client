#!/bin/bash

set -e

tests=("$@")
tests=${tests:-$(seq 1 1 22)}

dcci='docker-compose -f docker-compose.yml -f docker-compose.ci-separate.yml'

for i in "${tests[@]}"
do
  $dcci up -d bitcoind
  $dcci run dev \
    npm run integration-separate:ci:test -- -t=" $i-"
  $dcci down --volumes
done
