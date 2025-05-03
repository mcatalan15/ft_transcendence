FROM nginx:stable-alpine

ENV TZ=Europe/Paris

RUN apk add --no-cache nano openssl certbot certbot-nginx iputils

COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY tools/init-certs.sh .

RUN chmod -R 755 /usr/share/nginx/html \
    && chmod +x ./init-certs.sh

EXPOSE 80 443

ENTRYPOINT [ "./init-certs.sh" ]
#CMD ["nginx", "-g", "daemon off;"]
