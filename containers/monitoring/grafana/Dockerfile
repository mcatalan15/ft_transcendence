FROM grafana/grafana-enterprise

ENV TZ=Europe/Paris

COPY ./config/grafana.ini /etc/grafana/grafana.ini

EXPOSE 3100

# This always fails the password policy check for some reason
# RUN grafana cli admin reset-admin-password ${GF_SECURITY_ADMIN_PASSWORD}

USER grafana