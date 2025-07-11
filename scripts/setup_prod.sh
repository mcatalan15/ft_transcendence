#!/bin/bash

JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

while true; do
  PASSWORD=$(LC_CTYPE=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 20)
  [[ ${#PASSWORD} -ge 20 ]] &&
  [[ "$PASSWORD" =~ [A-Z] ]] &&
  [[ "$PASSWORD" =~ [a-z] ]] &&
  [[ "$PASSWORD" =~ [0-9] ]] && break
done

#echo $PASSWORD

#export GRAFANA_ADMIN_PASSWORD=${PASSWORD}

cat > containers/.env << EOF
JWT_SECRET='${JWT_SECRET}'
JWT_REFRESH_SECRET='${JWT_REFRESH_SECRET}'
JWT_EXPIRES_IN='15minutes'

ADMIN_EMAIL='ft.transcendence.42.pong@gmail.com'

DOMAIN_NAME=mrlouf.studio

NODE_ENV=production

# Database configuration
DB_PATH='/usr/src/app/db/mydatabase.db'

# For evaluation only
BLOCKCHAIN_PRIVATE_KEY=f7e2e781445f041877efab5a1c66d66163a51242e6407e05ce1d6137cbf36a1a
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/c/C/rpc

REDIS_URL=redis://redis:6379

SESSION_SECRET='${SESSION_SECRET}'

GRAFANA_ADMIN_PASSWORD='${GRAFANA_ADMIN_PASSWORD}'
EOF

echo ".env file created with secure defaults"
