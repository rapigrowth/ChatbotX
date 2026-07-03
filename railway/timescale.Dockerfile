FROM timescale/timescaledb-ha:pg18-all

USER root
COPY railway/timescale-entrypoint.sh /usr/local/bin/railway-timescale-entrypoint.sh
RUN chmod +x /usr/local/bin/railway-timescale-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/railway-timescale-entrypoint.sh"]
CMD ["postgres"]
