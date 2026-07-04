#!/bin/bash
set -euo pipefail

cd /app/apps/realtime

: "${REALTIME_BROADCAST_SECRET:?REALTIME_BROADCAST_SECRET is not set}"
printf 'REALTIME_BROADCAST_SECRET=%s\n' "$REALTIME_BROADCAST_SECRET" >.env
chmod 600 .env

exec env NODE_OPTIONS=--no-node-snapshot HOSTNAME=${HOSTNAME:-0.0.0.0} PORT=${PORT:-1999} pnpm dlx partykit dev
