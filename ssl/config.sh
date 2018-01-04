#!/usr/bin/env zsh

openssl genrsa -des3 -out rootCA.key 2048
chmod 600 rootCA.key
openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.pem
openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config <( cat server.csr.cnf )
chmod 600 server.key
openssl x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out server.crt -days 500 -sha256 -extfile v3.ext

rm rootCA.key
rm rootCA.srl
rm server.csr

echo 'Checking if sanhei-bills.test is in /etc/hosts'
grep 'sanhei-bills.test' /etc/hosts || echo '127.0.0.1 sanhei-bills.test' | sudo tee -a /etc/hosts

echo 'Installing certificate'
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain rootCA.pem
