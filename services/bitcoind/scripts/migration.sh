bitcoincli="bitcoin-cli -regtest"

$bitcoincli createwallet "alice" "false" "false" "alice"
$bitcoincli createwallet "bob" "false" "false" "bob"
aliceAddress=$($bitcoincli -rpcwallet=alice getnewaddress bec32)
$bitcoincli generatetoaddress 101 ${aliceAddress}
bobAddress=$($bitcoincli -rpcwallet=bob getnewaddress bec32)
$bitcoincli generatetoaddress 101 ${bobAddress}

