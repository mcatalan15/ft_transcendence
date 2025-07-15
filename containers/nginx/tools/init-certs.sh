#!/bin/sh

# Fake certs si pas de vrais
if [ ! -f /etc/letsencrypt/live/mrlouf.studio/fullchain.pem ]; then
  echo "Certificat manquant, création d'un placeholder temporaire..."
  mkdir -p /etc/letsencrypt/live/mrlouf.studio
  openssl req -x509 -nodes -newkey rsa:2048 \
    -keyout /etc/letsencrypt/live/mrlouf.studio/privkey.pem \
    -out /etc/letsencrypt/live/mrlouf.studio/fullchain.pem \
    -subj "/CN=localhost" -days 1
fi

echo "Lancement de Nginx..."
nginx -g 'daemon off;'
