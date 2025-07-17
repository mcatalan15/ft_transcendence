#!/bin/bash

echo "Fixing encoding issues in project files..."

# Fix .env file encoding
echo "Fixing .env file..."
cat > /Users/grao/Desktop/ft_transcendence/containers/.env << 'EOL'
JWT_SECRET='d157a3881e7fc14b986aa640a02d1b98aedffc742032920667495579da4a77e4'
JWT_REFRESH_SECRET='a52e4cd43717ed6cb022163830c31f45b7cba9fc8e11bdd1401980083b3b7a04'
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

SESSION_SECRET='124de6b05b012a24e9e9646d76fe1f505fd81a8e7124deaaf223ca77b52db46c'

GRAFANA_ADMIN_PASSWORD='d0LBVicsxcYrw'
EOL

# Ensure docker-compose.prod.yml ends correctly
echo "Fixing docker-compose.prod.yml..."
grep -q "networks:" /Users/grao/Desktop/ft_transcendence/containers/docker-compose.prod.yml
if [ $? -ne 0 ]; then
  echo "networks:" >> /Users/grao/Desktop/ft_transcendence/containers/docker-compose.prod.yml
  echo "  transcendence:" >> /Users/grao/Desktop/ft_transcendence/containers/docker-compose.prod.yml
else
  sed -i '' -e '$d' /Users/grao/Desktop/ft_transcendence/containers/docker-compose.prod.yml
  echo "  transcendence:" >> /Users/grao/Desktop/ft_transcendence/containers/docker-compose.prod.yml
fi

echo "Cleaning up any possible hidden characters..."
# Convert docker-compose.prod.yml to clean UTF-8
iconv -f UTF-8 -t UTF-8 -c /Users/grao/Desktop/ft_transcendence/containers/docker-compose.prod.yml > /tmp/clean_docker_compose.yml
mv /tmp/clean_docker_compose.yml /Users/grao/Desktop/ft_transcendence/containers/docker-compose.prod.yml

echo "Done fixing encoding issues! Try running 'make' again."
