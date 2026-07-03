#!/bin/sh
set -eu

export PGDATA="${PGDATA:-/home/postgres/pgdata/data/pgdata}"

mkdir -p "$PGDATA"
chown -R 1000:1000 /home/postgres/pgdata

if [ -x /docker-entrypoint.sh ]; then
  exec /docker-entrypoint.sh "$@"
fi

exec docker-entrypoint.sh "$@"
