#!/bin/bash

DOMAIN="mrlouf.studio"
EMAIL=${ADMIN_EMAIL}

if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  echo "✅ Certificate found for $DOMAIN. Recovering..."
  certbot install --nginx --cert-name "$DOMAIN" --non-interactive || {
    echo "❌ Recovery failed."
    exit 1
  }
else
  echo "⚠️  No certificate found. Generating new cert for $DOMAIN..."
  certbot certonly --nginx \
    -d "$DOMAIN" -d "www.$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --no-eff-email \
    --email "$EMAIL" || {
      echo "❌ Generation failed."
      exit 1
    }

  echo "✅ Certificate issued successfully."
fi

echo "🚀 Starting NGINX..."
exec nginx -g 'daemon off;'
