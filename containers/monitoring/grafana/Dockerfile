FROM grafana/grafana-enterprise

# Copy Grafana configuration file
COPY ./config/grafana.ini /usr/local/share/grafana/conf/defaults.ini

# Expose necessary ports
EXPOSE 3100

# Start Grafana server
CMD ["/usr/local/bin/grafana-server", "-homepath", "/usr/local/share/grafana", "-config", "/usr/local/share/grafana/conf/defaults.ini", "web"]
