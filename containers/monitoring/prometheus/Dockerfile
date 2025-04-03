FROM alpine:3.21

ENV PROMETHEUS_VERSION=2.46.0

RUN apk update && apk add --no-cache \
    curl \
    bash \
    ca-certificates \
    && rm -rf /var/cache/apk/*

RUN curl -LO https://github.com/prometheus/prometheus/releases/download/v${PROMETHEUS_VERSION}/prometheus-${PROMETHEUS_VERSION}.linux-amd64.tar.gz \
    && tar -xvzf prometheus-${PROMETHEUS_VERSION}.linux-amd64.tar.gz \
    && mv prometheus-${PROMETHEUS_VERSION}.linux-amd64/prometheus /bin/prometheus \
    && mv prometheus-${PROMETHEUS_VERSION}.linux-amd64/promtool /bin/promtool \
    && rm -rf prometheus-${PROMETHEUS_VERSION}.linux-amd64*

# Create necessary directories
RUN mkdir -p /etc/prometheus /prometheus

COPY config/prometheus.yml /etc/prometheus/prometheus.yml

EXPOSE 9090

CMD ["/bin/prometheus", "--config.file=/etc/prometheus/prometheus.yml", "--storage.tsdb.path=/prometheus"]

