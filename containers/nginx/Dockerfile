FROM nginx

RUN apt-get update \
    && apt-get install -y iputils-ping \
    && apt-get clean

COPY conf/nginx.conf /etc/nginx/nginx.conf

RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
