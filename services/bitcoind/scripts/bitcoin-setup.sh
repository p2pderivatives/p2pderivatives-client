bitcoincli="bitcoin-cli -regtest"

$bitcoincli createwallet "alice" "false" "false" "alice"
$bitcoincli createwallet "bob" "false" "false" "bob"
aliceAddress=$($bitcoincli -rpcwallet=alice getnewaddress bec32)
$bitcoincli generatetoaddress 101 ${aliceAddress}
bobAddress=$($bitcoincli -rpcwallet=bob getnewaddress bec32)
$bitcoincli generatetoaddress 101 ${bobAddress}
$bitcoincli -rpcwallet=alice walletpassphrase "alice" 30
txamount=10
txid=$($bitcoincli -rpcwallet=alice sendtoaddress $bobAddress $txamount)

rm -f /vectors/vector.yml tmp/vector.yml 
( echo "cat <<EOF >/vectors/vector.yml";
  cat /scripts/vector.template.yml;
  echo "EOF";
) > /tmp/vector.yml
. /tmp/vector.yml
