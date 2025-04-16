FROM alpine:3.21

RUN apk update && apk add --no-cache ca-certificates curl

RUN mkdir -p /app \
    && cd /app \
    && wget https://github.com/portainer/portainer/releases/download/2.27.1/portainer-2.27.1-linux-amd64.tar.gz \
    && tar xvzf portainer-2.27.1-linux-amd64.tar.gz --strip-components=1 \
    && rm portainer-2.27.1-linux-amd64.tar.gz

EXPOSE 9000

RUN mkdir -p /data

# Define volumes for persistent data and Docker socket
VOLUME ["/data", "/var/run/docker.sock"]

# Set container to always restart
LABEL com.centurylinklabs.watchtower.enable="true"

WORKDIR /app

ENTRYPOINT ["/app/portainer"]