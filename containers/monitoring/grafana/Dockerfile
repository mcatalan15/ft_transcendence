FROM grafana/grafana-enterprise

COPY ./config/grafana.ini /etc/grafana/grafana.ini

EXPOSE 3100

#CMD ["/usr/local/bin/grafana-server", "-homepath", "/usr/local/share/grafana", "-config", "/usr/local/share/grafana/conf/defaults.ini", "web"]
USER grafana