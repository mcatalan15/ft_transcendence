FROM alpine:3.21

# Install dependencies
RUN apk update && apk add --no-cache \
    curl \
    bash \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Download and install Grafana
RUN curl -LO https://dl.grafana.com/oss/release/grafana-9.4.0.linux-amd64.tar.gz \
    && tar -zxvf grafana-9.4.0.linux-amd64.tar.gz \
    && mv grafana-9.4.0/bin/grafana-server /usr/local/bin/grafana-server \
    && mv grafana-9.4.0/bin/grafana-cli /usr/local/bin/grafana-cli \
    && rm -rf grafana-9.4.0*

# Check if the binaries are correctly installed
RUN ls -alh /usr/local/bin/

# Set executable permissions for Grafana binaries
RUN chmod +x /usr/local/bin/grafana-server /usr/local/bin/grafana-cli

# Create necessary directories for Grafana configuration and data
RUN mkdir -p /etc/grafana /var/lib/grafana

# Copy the custom Grafana configuration file
COPY ./config/grafana.ini /etc/grafana/grafana.ini

# Expose Grafana's default port
EXPOSE 3000

# Explicitly use the full path to start the Grafana server
CMD ["/usr/local/bin/grafana-server", "web"]

