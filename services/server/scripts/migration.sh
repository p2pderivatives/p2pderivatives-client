default_pass="123456B@n"
./p2pdclient registeruser -server localhost:8080 -name test_user -password $default_pass
./p2pdclient registeruser -server localhost:8080 -name update_pass_user -password $default_pass
./p2pdclient registeruser -server localhost:8080 -name unregister_user -password $default_pass
