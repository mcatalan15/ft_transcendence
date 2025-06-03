#!/bin/bash
# generate-certs.sh - Creates self-signed certs for local HTTPS

mkdir -p containers/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout containers/nginx/ssl/server.key \
  -out containers/nginx/ssl/server.crt \
  -subj "/C=ES/ST=Barcelona/L=Barcelona/O=42/CN=localhost"

echo "Self-signed certificates generated"