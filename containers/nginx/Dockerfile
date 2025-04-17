FROM nginx

RUN apt-get update \
    && apt-get install -y gettext-base certbot python3-certbot-nginx iputils-ping \
    && apt-get clean

COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY tools/init-cert.sh .

RUN chmod -R 755 /usr/share/nginx/html	\
	&& chmod 777 ./init-cert.sh

EXPOSE 80 443

CMD [ "/init-cert.sh" ]
