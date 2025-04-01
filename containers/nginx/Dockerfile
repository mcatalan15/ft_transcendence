FROM nginx

COPY conf/nginx.conf /etc/nginx/nginx.conf

# Remove default files from /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/*

RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 1080