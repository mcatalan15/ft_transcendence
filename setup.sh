#!/bin/bash

JWT_SECRET=$(openssl rand -hex 32)

cat > containers/.env << EOF
JWT_SECRET='${JWT_SECRET}'
JWT_EXPIRES_IN=90

ADMIN_EMAIL='ft.transcendence.42.pong@gmail.com'

# Database configuration
DB_PATH='/usr/src/app/db/mydatabase.db'

# For evaluation only
BLOCKCHAIN_PRIVATE_KEY=f7e2e781445f041877efab5a1c66d66163a51242e6407e05ce1d6137cbf36a1a
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/c/C/rpc
EOF

echo ".env file created with secure defaults"
