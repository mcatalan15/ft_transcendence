FROM redis:alpine3.21

ENV TZ=Europe/Paris

COPY ./conf/redis.conf /usr/local/etc/redis/redis.conf

EXPOSE 6379

CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]