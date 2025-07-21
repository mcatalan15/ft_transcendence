FROM grafana/grafana-enterprise

ENV TZ=Europe/Paris

USER root

COPY ./config/grafana.ini /etc/grafana/grafana.ini
COPY ./config/dashboards/App_health_status.json /etc/grafana/dashboards/App_health_status.json
COPY ./config/provisioning/datasources/prometheus.yaml /etc/grafana/provisioning/datasources/prometheus.yaml
COPY ./config/provisioning/dashboards/dashboards.yaml /etc/grafana/provisioning/dashboards/dashboards.yaml

EXPOSE 3100