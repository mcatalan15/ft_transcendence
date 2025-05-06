FROM alpine:3.21

ENV TZ=Europe/Paris

RUN apk add --no-cache \
    ca-certificates \
    && update-ca-certificates \
    && apk add --no-cache \
    php \
    php-fpm \
    php-sqlite3 \
	php-session \
    && rm -rf /var/cache/apk/*

RUN mkdir -p /var/www/html \
	&& wget "https://github.com/vrana/adminer/releases/download/v4.8.1/adminer-4.8.1.php" -O /var/www/html/index.php

EXPOSE 1090

RUN chmod -R 755 /var/www/html

COPY tools/entrypoint.sh /entrypoint.sh
COPY tools/auth.php /var/www/html/auth.php

RUN chmod +x /entrypoint.sh
RUN chmod +x /var/www/html/auth.php

ENTRYPOINT ["/entrypoint.sh"]

CMD ["php", "-S", "0.0.0.0:1090", "-t", "/var/www/html"]
