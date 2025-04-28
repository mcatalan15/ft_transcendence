FROM grafana/grafana-enterprise

COPY ./config/grafana.ini /usr/local/share/grafana/conf/defaults.ini

EXPOSE 3100

CMD ["/usr/local/bin/grafana-server", "-homepath", "/usr/local/share/grafana", "-config", "/usr/local/share/grafana/conf/defaults.ini", "web"]
