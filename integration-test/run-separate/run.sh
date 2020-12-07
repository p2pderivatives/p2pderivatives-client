#!/bin/bash

set -e

tests=("$@")
default=($(seq 1 1 3))
tests=("${tests[@]:-${default[@]}}")

if [ ! -z "${ISCI}" ]
then
  dcparam="-f docker-compose.yml -f docker-compose.ci-separate.yml -p integration-separate-${CIRCLE_NODE_INDEX}"
  rundev="docker-compose ${dcparam} run dev"
  dirpref="./reports/"
  ci=":ci"
  # Make sure everything is down before starting
  docker-compose ${dcparam} down -v
fi

mergeParam=()
dirPaths=()

coveragedir="${dirpref}coverage/integration-separate/"

for i in "${tests[@]}"
do
  directory="${coveragedir}${i}"
  eval docker-compose ${dcparam} up -d bitcoind
  eval ${rundev} npm run integration-separate${ci}:test -- -t="\" ${i}-\""\
       --coverageDirectory=${directory}
  eval docker-compose ${dcparam} down --volumes
  mergeParam+=("${directory}/coverage-final.json")
  dirPaths+=("${directory}")
done

eval ${rundev} npx istanbul-merge --out "${coveragedir}coverage-final${CIRCLE_NODE_INDEX}.json ${mergeParam[@]}"

if [ -z "${ISCI}" ]
then
  npx istanbul report --include "${coveragedir}coverage-final.json --dir ${coveragedir} html"
fi

eval ${rundev} rm -r "${dirPaths[@]}"
