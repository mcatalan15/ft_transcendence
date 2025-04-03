FROM alpine:3.21

# Install dependencies
RUN apk update && apk add --no-cache \
    wget \
    bash \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Download and install Grafana
RUN wget https://dl.grafana.com/oss/release/grafana-11.6.0.linux-amd64.tar.gz	\
	&& tar -zxvf grafana-11.6.0.linux-amd64.tar.gz \
    && mv ./grafana-v11.6.0/bin/grafana /usr/local/bin/ \
    && mv ./grafana-v11.6.0/bin/grafana-cli /usr/local/bin/grafana-cli \
    && rm -rf grafana-v11.6.0*

RUN chmod +x /usr/local/bin/grafana /usr/local/bin/grafana-cli

RUN mkdir -p /etc/grafana /var/lib/grafana

COPY ./config/grafana.ini /etc/grafana/grafana.ini

EXPOSE 3000

CMD ["/usr/local/bin/grafana", "server"]
