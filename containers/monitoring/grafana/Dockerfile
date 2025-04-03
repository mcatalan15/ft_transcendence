FROM alpine:3.21

# Install dependencies
RUN apk update && apk add --no-cache \
    wget \
    bash \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Download and install Grafana
RUN wget https://dl.grafana.com/oss/release/grafana-11.6.0.linux-amd64.tar.gz \
    && tar -zxvf grafana-11.6.0.linux-amd64.tar.gz \
    && mv ./grafana-v11.6.0/bin/grafana-server /usr/local/bin/ \
    && mv ./grafana-v11.6.0/bin/grafana /usr/local/bin/ \
    && mv ./grafana-v11.6.0/bin/grafana-cli /usr/local/bin/ \
	&& mv ./grafana-v11.6.0/public/emails/ /usr/local/share/grafana/emails/ \
    && rm -rf grafana-v11.6.0* \
    && chmod +x /usr/local/bin/grafana-server /usr/local/bin/grafana-cli

# Create necessary directories for Grafana in appropriate locations
RUN mkdir -p /usr/local/share/grafana/conf /usr/local/share/grafana/data \
    && chown -R 1000:1000 /usr/local/share/grafana \
    && chmod -R 755 /usr/local/share/grafana

# Copy Grafana configuration file
COPY ./config/grafana.ini /usr/local/share/grafana/conf/defaults.ini

# Expose necessary ports
EXPOSE 3100

# Start Grafana server
CMD ["/usr/local/bin/grafana-server", "-homepath", "/usr/local/share/grafana", "-config", "/usr/local/share/grafana/conf/defaults.ini", "web"]
