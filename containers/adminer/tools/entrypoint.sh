#!/bin/sh
chmod 755 /db/mydatabase.db

# Allow access without login
sed -i 's/login($_e,$F){if($F=="")return/login($_e,$F){if($F=="abc")return/' /var/www/html/index.php

exec "$@"